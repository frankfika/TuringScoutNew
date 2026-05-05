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

const VIEWPORT = { width: 1280, height: 800 };

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name, options = {}) {
  const path = join(assetsDir, `${name}.png`);
  const { width = VIEWPORT.width, height = VIEWPORT.height, wait = 1000 } = options;

  await page.setViewportSize({ width, height });
  await sleep(wait);
  await page.screenshot({ path, type: 'png' });

  console.log(`📸 Screenshot saved: ${path}`);
  return path;
}

async function captureScreenshots() {
  // Create assets directory
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2  // High-res screenshots
  });
  const page = await context.newPage();

  const BASE_URL = 'http://localhost:3000';

  try {
    // 1. Home page - Main landing
    console.log('\n📷 Capturing home page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await sleep(2000); // Wait for animations
    await captureScreenshot(page, 'home', { wait: 2000 });

    // 2. Project detail page
    console.log('📷 Capturing project detail...');
    await page.goto(`${BASE_URL}/projects/langchain`, { waitUntil: 'networkidle' });
    await sleep(1500);
    await captureScreenshot(page, 'project-detail', { wait: 1500 });

    // 3. Opportunity detail page
    console.log('📷 Capturing opportunity detail...');
    await page.goto(`${BASE_URL}/opportunities/langchain-plugin-bounty`, { waitUntil: 'networkidle' });
    await sleep(1500);
    await captureScreenshot(page, 'opportunity-detail', { wait: 1500 });

    // 4. Agent marketplace
    console.log('📷 Capturing agent marketplace...');
    await page.goto(`${BASE_URL}/agents`, { waitUntil: 'networkidle' });
    await sleep(1500);
    await captureScreenshot(page, 'agent-marketplace', { wait: 1500 });

    // 5. Admin login
    console.log('📷 Capturing admin login...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await sleep(1000);
    await captureScreenshot(page, 'admin-login', { wait: 1000 });

    // 6. Login and capture admin dashboard
    console.log('🔐 Logging into admin...');
    await page.fill('input[type="password"]', 'turingscout-admin');
    await page.click('button[type="submit"]');
    await sleep(2000);

    console.log('📷 Capturing admin dashboard...');
    await captureScreenshot(page, 'admin-dashboard', { wait: 2000 });

    // 7. Admin data management
    console.log('📷 Capturing admin data management...');
    await page.click('text=03. Data Management');
    await sleep(1500);
    await captureScreenshot(page, 'admin-data-management', { wait: 1500 });

    console.log('\n✨ All screenshots generated!');
    console.log(`📁 Location: ${assetsDir}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
