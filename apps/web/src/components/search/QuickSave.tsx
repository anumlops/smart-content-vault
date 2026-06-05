"use client";

import { useState, useRef, useCallback } from "react";
import { Link, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

interface QuickSaveProps {
  onSaved?: () => void;
}

export function QuickSave({ onSaved }: QuickSaveProps) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaved = useRef(false);

  function validate(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setIsValid(null);
      return false;
    }
    const valid = isValidUrl(trimmed);
    setIsValid(valid);
    return valid;
  }

  async function save(value: string) {
    const trimmed = value.trim();
    if (!trimmed || !isValidUrl(trimmed)) return;

    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save content");
      }

      toast({ title: "Link saved!", description: "URL has been archived." });
      setUrl("");
      setIsValid(null);
      autoSaved.current = false;
      onSaved?.();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  }

  const handleChange = useCallback((value: string) => {
    setUrl(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    autoSaved.current = false;

    const valid = validate(value);
    if (valid) {
      timerRef.current = setTimeout(() => {
        autoSaved.current = true;
        save(value);
      }, 400);
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (isValidUrl(pasted)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setUrl(pasted);
      setIsValid(true);
      autoSaved.current = true;
      save(pasted);
    }
  }, []);

  function handleManualSave() {
    autoSaved.current = true;
    save(url);
  }

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none shrink-0" aria-hidden="true" />
          <Input
            placeholder="Paste a link to save instantly..."
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            disabled={saving}
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-9 h-11 text-sm pr-10"
            aria-label="Quick save a link"
          />
          {url && !saving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid === true && <CheckCircle2 className="h-4 w-4 text-success" />}
              {isValid === false && <AlertCircle className="h-4 w-4 text-destructive" />}
            </div>
          )}
          {saving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {isValid === false && url.trim().length > 0 && (
          <Button
            type="button"
            size="sm"
            className="h-11 shrink-0 px-4 gap-1.5"
            onClick={handleManualSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving
              </>
            ) : (
              "Save"
            )}
          </Button>
        )}
      </div>
      {isValid === false && url.trim().length > 0 && !saving && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1.5" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" />
          Please check the URL — must start with https://
        </p>
      )}
    </div>
  );
}
