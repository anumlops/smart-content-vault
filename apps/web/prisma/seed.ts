import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@contentarchive.dev" },
    update: {},
    create: {
      email: "demo@contentarchive.dev",
      name: "Demo User",
    },
  });

  const demoContents = [
    {
      url: "https://youtube.com/watch?v=example1",
      title: "Understanding Transformer Neural Networks",
      description: "Deep dive into transformer architecture and attention mechanisms",
      contentType: "youtube",
      category: "AI",
      tags: JSON.stringify(["deep learning", "transformers", "neural networks", "attention"]),
      summary: "A comprehensive explanation of how transformer neural networks work, including self-attention mechanisms, positional encoding, and multi-head attention.",
      emotionalTone: "educational",
      educationalRelevance: 9,
      note: "Great explanation of transformers",
    },
    {
      url: "https://instagram.com/p/example2",
      title: "My Startup Journey - From Zero to Series A",
      description: "The emotional rollercoaster of building a startup",
      contentType: "instagram",
      category: "Startups",
      tags: JSON.stringify(["startup", "entrepreneurship", "fundraising", "journey"]),
      summary: "A founder shares their personal journey of building a startup from ideation to Series A funding, including the challenges and triumphs along the way.",
      emotionalTone: "inspirational",
      educationalRelevance: 7,
      note: "Very inspirational, saved for motivation",
    },
    {
      url: "https://twitter.com/user/status/example3",
      title: "Thread: Understanding Zero-Knowledge Proofs",
      description: "A Twitter thread explaining zk-proofs in simple terms",
      contentType: "twitter",
      category: "Cybersecurity",
      tags: JSON.stringify(["cryptography", "zero-knowledge proofs", "security", "blockchain"]),
      summary: "An accessible Twitter thread that breaks down zero-knowledge proofs, explaining how they work and why they matter for privacy and security.",
      emotionalTone: "educational",
      educationalRelevance: 8,
    },
    {
      url: "https://example.com/blog/ai-agents",
      title: "The Rise of AI Agents in 2024",
      description: "How AI agents are transforming software development",
      contentType: "blog",
      category: "Technology",
      tags: JSON.stringify(["ai agents", "automation", "software development", "future of tech"]),
      summary: "An analysis of how AI agents are becoming increasingly capable and how they are starting to transform software development workflows.",
      emotionalTone: "exciting",
      educationalRelevance: 6,
      note: "Important trend to watch",
    },
    {
      url: "https://example.com/article/crypto-market",
      title: "Cryptocurrency Market Analysis: Q2 2024",
      description: "Detailed analysis of crypto market trends and predictions",
      contentType: "article",
      category: "Cryptocurrency",
      tags: JSON.stringify(["crypto", "bitcoin", "ethereum", "market analysis", "trading"]),
      summary: "A thorough analysis of the cryptocurrency market in Q2 2024, covering Bitcoin, Ethereum, and emerging altcoin trends with market predictions.",
      emotionalTone: "neutral",
      educationalRelevance: 7,
    },
  ];

  for (const content of demoContents) {
    await prisma.savedContent.create({
      data: {
        userId: user.id,
        ...content,
        processingStatus: "completed",
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
