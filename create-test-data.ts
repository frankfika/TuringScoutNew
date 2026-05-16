/**
 * 创建真实的测试数据：Agent + Service
 * 演示 A2A + x402 + 区块链登录的完整集成
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestData() {
  console.log("🚀 Creating test data for A2A + x402 + Wallet integration...\n");

  // 1. 创建测试项目
  const project = await prisma.project.upsert({
    where: { slug: "ai-image-generator" },
    update: {},
    create: {
      slug: "ai-image-generator",
      name: "AI Image Generator",
      description: "Generate stunning AI images using advanced models",
      url: "https://github.com/example/ai-image-gen",
      githubUrl: "https://github.com/example/ai-image-gen",
      category: "AI_TOOLS",
      status: "ACTIVE",
    },
  });

  console.log("✅ Created project:", project.name);

  // 2. 创建 Agent Card
  const agent = await prisma.agentCard.upsert({
    where: { id: "test-agent-001" },
    update: {},
    create: {
      id: "test-agent-001",
      projectId: project.id,
      name: "ImageGen AI Agent",
      description: "AI-powered image generation agent. Supports text-to-image, image-to-image, and style transfer.",
      version: "1.0.0",
      endpointUrl: "https://api.example.com/a2a",
      capabilities: JSON.stringify(["text-to-image", "image-to-image", "style-transfer"]),
      status: "ACTIVE",
      walletSolana: "DemoSolWallet1111111111111111111111111111111",
      walletEvm: "0x1234567890123456789012345678901234567890",
    },
  });

  console.log("✅ Created agent:", agent.name);

  // 3. 创建免费服务（用于测试基本流程）
  const freeService = await prisma.agentService.upsert({
    where: { id: "service-free-001" },
    update: {},
    create: {
      id: "service-free-001",
      agentId: agent.id,
      name: "Basic Image Generation (Free)",
      description: "Generate a basic AI image. Free tier with standard quality.",
      priceUsd: 0,
      acceptedChains: JSON.stringify(["solana", "evm", "base"]),
      acceptedToken: "USDC",
      endpointPath: "/generate/basic",
      inputModes: JSON.stringify(["text"]),
      outputModes: JSON.stringify(["image"]),
      status: "ACTIVE",
    },
  });

  console.log("✅ Created free service:", freeService.name);

  // 4. 创建付费服务（用于测试 402 + 支付流程）
  const paidService = await prisma.agentService.upsert({
    where: { id: "service-paid-001" },
    update: {},
    create: {
      id: "service-paid-001",
      agentId: agent.id,
      name: "Premium Image Generation",
      description: "Generate high-quality AI images with advanced models. Supports custom styles and higher resolution.",
      priceUsd: 5.0,
      acceptedChains: JSON.stringify(["solana", "evm"]),
      acceptedToken: "USDC",
      endpointPath: "/generate/premium",
      inputModes: JSON.stringify(["text", "image"]),
      outputModes: JSON.stringify(["image"]),
      status: "ACTIVE",
    },
  });

  console.log("✅ Created paid service:", paidService.name);

  // 5. 创建另一个付费服务（测试多链支持）
  const paidService2 = await prisma.agentService.upsert({
    where: { id: "service-paid-002" },
    update: {},
    create: {
      id: "service-paid-002",
      agentId: agent.id,
      name: "Batch Image Generation",
      description: "Generate multiple images in one request. Perfect for creating variations or exploring different styles.",
      priceUsd: 10.0,
      acceptedChains: JSON.stringify(["solana", "evm", "base"]),
      acceptedToken: "USDC",
      endpointPath: "/generate/batch",
      inputModes: JSON.stringify(["text"]),
      outputModes: JSON.stringify(["image"]),
      status: "ACTIVE",
    },
  });

  console.log("✅ Created paid service 2:", paidService2.name);

  console.log("\n🎉 Test data created successfully!\n");
  console.log("📋 Test Case Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Agent ID: ${agent.id}`);
  console.log(`Agent Name: ${agent.name}`);
  console.log(`Free Service: ${freeService.name} ($${freeService.priceUsd})`);
  console.log(`Paid Service 1: ${paidService.name} ($${paidService.priceUsd})`);
  console.log(`Paid Service 2: ${paidService2.name} ($${paidService2.priceUsd})`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🔗 Test Flow:");
  console.log("1. Visit: http://localhost:3000/agents");
  console.log("2. Click on 'ImageGen AI Agent'");
  console.log("3. Connect your wallet (Solana or EVM)");
  console.log("4. Try the free service first (no payment required)");
  console.log("5. Try the paid service ($5) - will trigger 402 Payment Required");
  console.log("6. Click 'Pay Now' to complete payment via wallet");
  console.log("7. Task will auto-complete after payment verification\n");

  console.log("💡 Key Integration Points:");
  console.log("- Wallet login provides user identity (address + chain)");
  console.log("- A2A task automatically uses logged-in wallet's chain");
  console.log("- 402 response includes user's wallet address as payer");
  console.log("- PaymentFlow component calls wallet plugin directly");
  console.log("- Payment verification unlocks A2A task automatically\n");
}

createTestData()
  .catch((e) => {
    console.error("❌ Error creating test data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
