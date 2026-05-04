import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { CronJob } from 'cron';

const prisma = new PrismaClient();

// 更新所有项目的 GitHub 数据
async function updateGithubData() {
  console.log(`🔄 [${new Date().toISOString()}] Starting GitHub data update...`);

  const projects = await prisma.project.findMany({
    where: {
      githubUrl: { not: null },
      status: "ACTIVE",
    },
  });

  let successCount = 0;
  let failCount = 0;

  for (const project of projects) {
    try {
      if (!project.githubUrl) continue;

      const match = project.githubUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
      if (!match) continue;

      const [, owner, name] = match;

      // Fetch from GitHub API (with token if available)
      const headers: Record<string, string> = {};
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }
      const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, { headers });
      if (!response.ok) {
        console.log(`  ❌ ${project.name} - GitHub API error: ${response.status}`);
        failCount++;
        continue;
      }

      const data = await response.json();

      // Update project
      await prisma.project.update({
        where: { id: project.id },
        data: {
          description: data.description || project.description,
          language: data.language || project.language,
          topics: JSON.stringify(data.topics || []),
          lastSeenAt: new Date(),
        },
      });

      // Add new evidence
      await prisma.evidence.create({
        data: {
          projectId: project.id,
          metric: "stars",
          value: data.stargazers_count,
          recordedAt: new Date(),
        },
      });

      await prisma.evidence.create({
        data: {
          projectId: project.id,
          metric: "forks",
          value: data.forks_count,
          recordedAt: new Date(),
        },
      });

      console.log(`  ✅ ${project.name} - ${data.stargazers_count} ⭐`);
      successCount++;

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.log(`  ❌ ${project.name} - ${err instanceof Error ? err.message : "Unknown error"}`);
      failCount++;
    }
  }

  console.log(`✨ Update completed: ${successCount} succeeded, ${failCount} failed\n`);
}

// 生成模拟的 Community Feed 数据
async function updateCommunityFeed() {
  console.log(`📰 [${new Date().toISOString()}] Updating community feed...`);

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { lastSeenAt: "desc" },
    take: 10,
  });

  const templates = [
    { type: "tweet", template: (name: string) => `🔥 ${name} just hit a new milestone! The community is buzzing.` },
    { type: "tweet", template: (name: string) => `📈 ${name} trending on GitHub today. Worth checking out!` },
    { type: "ai_summary", template: (name: string) => `${name} shows strong momentum with growing contributor activity.`, rating: "High Impact" },
    { type: "tweet", template: (name: string) => `🚀 New features landed in ${name}. The ecosystem keeps evolving.` },
    { type: "ai_summary", template: (name: string) => `${name} maintains steady growth trajectory with consistent community engagement.`, rating: "Trend Alert" },
  ];

  // Create 3-5 new community posts
  const numPosts = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numPosts; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const template = templates[Math.floor(Math.random() * templates.length)];

    await prisma.communityPost.create({
      data: {
        type: template.type,
        author: template.type === "ai_summary" ? "TuringScout AI" : "Tech Radar",
        handle: template.type === "ai_summary" ? "@turing_eval" : "@techradar",
        avatar: template.type === "ai_summary" ? "🤖" : "T",
        content: template.template(project.name),
        rating: template.type === "ai_summary" ? template.rating : undefined,
        projectId: project.id,
        likes: Math.floor(Math.random() * 200) + 20,
        retweets: Math.floor(Math.random() * 50) + 5,
        publishedAt: new Date(),
      },
    });
  }

  console.log(`✅ Created ${numPosts} new community posts\n`);
}

// 清理旧的 Community Feed（保留最近 100 条）
async function cleanupOldPosts() {
  const posts = await prisma.communityPost.findMany({
    orderBy: { publishedAt: "desc" },
    skip: 100,
  });

  if (posts.length > 0) {
    await prisma.communityPost.deleteMany({
      where: {
        id: { in: posts.map(p => p.id) },
      },
    });
    console.log(`🧹 Cleaned up ${posts.length} old community posts\n`);
  }
}

// 启动定时任务
function startScheduler() {
  console.log("🚀 Starting TuringScout Auto-Update Scheduler...\n");

  // 每 6 小时更新一次 GitHub 数据
  const githubUpdateJob = new CronJob('0 */6 * * *', async () => {
    await updateGithubData();
  });

  // 每 15 分钟更新一次 Community Feed
  const feedUpdateJob = new CronJob('*/15 * * * *', async () => {
    await updateCommunityFeed();
    await cleanupOldPosts();
  });

  githubUpdateJob.start();
  feedUpdateJob.start();

  console.log("✅ Scheduler started:");
  console.log("  - GitHub data update: every 6 hours");
  console.log("  - Community feed update: every 15 minutes\n");

  // 立即执行一次
  updateGithubData();
  updateCommunityFeed();
}

// 启动调度器
startScheduler();

// 保持进程运行
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down scheduler...');
  await prisma.$disconnect();
  process.exit(0);
});
