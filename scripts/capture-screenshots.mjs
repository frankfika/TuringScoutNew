#!/usr/bin/env node
/**
 * TuringScout Screenshot Capture Script
 * Generates beautiful screenshots for README from real running app
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const assetsDir = join(rootDir, 'docs', 'assets');

const VIEWPORT = { width: 1280, height: 900 };

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name, options = {}) {
  const path = join(assetsDir, `${name}.png`);
  const { width = VIEWPORT.width, height = VIEWPORT.height, wait = 1500 } = options;

  await page.setViewportSize({ width, height });
  await sleep(wait);
  await page.screenshot({ path, type: 'png' });

  console.log(`📸 Screenshot saved: ${path}`);
  return path;
}

async function captureScreenshots() {
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const BASE_URL = 'http://localhost:3000';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'ts-admin-2026';

  try {
    // 1. Home page
    console.log('\n📷 Capturing home page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await captureScreenshot(page, 'home', { wait: 2000 });

    // 2. Project detail
    console.log('📷 Capturing project detail...');
    await page.goto(`${BASE_URL}/projects/langchain`, { waitUntil: 'networkidle' });
    await captureScreenshot(page, 'project-detail', { wait: 1500 });

    // 3. Agent marketplace
    console.log('📷 Capturing agent marketplace...');
    await page.goto(`${BASE_URL}/agents`, { waitUntil: 'networkidle' });
    await captureScreenshot(page, 'agent-marketplace', { wait: 1500 });

    // 4. Agent detail (A2A + x402)
    console.log('📷 Capturing agent detail...');
    await page.goto(`${BASE_URL}/agents/test-agent-001`, { waitUntil: 'networkidle' });
    await captureScreenshot(page, 'agent-detail', { wait: 1500 });

    // 5. Methodology
    console.log('📷 Capturing methodology...');
    await page.goto(`${BASE_URL}/methodology`, { waitUntil: 'networkidle' });
    await captureScreenshot(page, 'methodology', { wait: 1500 });

    // 6. Admin login + dashboard
    console.log('📷 Capturing admin dashboard...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await sleep(500);
    await page.fill('input[type="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await sleep(2000);
    await captureScreenshot(page, 'admin-dashboard', { wait: 1000 });

    console.log('\n✨ All screenshots generated!');
    console.log(`📁 Location: ${assetsDir}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
