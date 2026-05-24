param(
    [string]$RepoPath = (Get-Location).Path,
    [int]$IntervalSeconds = 60,
    [switch]$Daemon
)

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $RepoPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$ignoreDirs = @("node_modules", ".next", ".git", "dist", "__pycache__", ".venv", "venv")
$ignoreExts = @(".log", ".pyc", ".db")

$changed = @{}
$debounce = 10  # seconds to wait after last change before committing

function Should-Ignore($path) {
    foreach ($dir in $ignoreDirs) {
        if ($path -match [regex]::Escape($dir)) { return $true }
    }
    foreach ($ext in $ignoreExts) {
        if ($path -like "*$ext") { return $true }
    }
    return $false
}

$action = {
    $path = $Event.SourceEventArgs.FullPath
    if (Should-Ignore $path) { return }
    $changed[(Get-Date)] = $path
}

Register-ObjectEvent $watcher "Changed" -Action $action > $null
Register-ObjectEvent $watcher "Created" -Action $action > $null
Register-ObjectEvent $watcher "Deleted" -Action $action > $null
Register-ObjectEvent $watcher "Renamed" -Action $action > $null

Write-Host "Auto-commit watcher started on $RepoPath"
Write-Host "Checking for changes every $IntervalSeconds seconds..."

while ($true) {
    Start-Sleep -Seconds $IntervalSeconds
    if ($changed.Count -gt 0) {
        $lastChange = ($changed.Keys | Sort-Object -Descending | Select-Object -First 1)
        $elapsed = [int]((Get-Date) - $lastChange).TotalSeconds
        if ($elapsed -ge $debounce) {
            try {
                Push-Location $RepoPath
                $status = git status --porcelain
                if ($status) {
                    Write-Host "Changes detected, committing..."
                    git add -A
                    $count = ($status | Measure-Object -Line).Lines
                    git commit -m "auto: $count file(s) changed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                    Write-Host "Committed $count file(s)"
                }
                $changed.Clear()
            } catch {
                Write-Warning "Auto-commit failed: $_"
            } finally {
                Pop-Location
            }
        }
    }
}
