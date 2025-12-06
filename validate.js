#!/usr/bin/env node
require('./polyfill');

console.log('='.repeat(60));
console.log('AutoSecure Discord Bot - Code Validation');
console.log('='.repeat(60));
console.log('');

const fs = require('fs');
const path = require('path');

let errors = [];
let warnings = [];

console.log('[1/5] Checking polyfill...');
if (typeof globalThis.File !== 'undefined') {
  console.log('  OK: File API is available (polyfill or native)');
} else {
  errors.push('File API polyfill failed to load');
}

console.log('[2/5] Checking core modules...');
const coreModules = [
  './db/database',
  './mainbot/controllerbot',
  './mainbot/handlers/initializeBots',
];
for (const mod of coreModules) {
  try {
    require.resolve(mod);
    console.log(`  OK: ${mod}`);
  } catch (e) {
    errors.push(`Module not found: ${mod}`);
  }
}

console.log('[3/5] Checking config.json...');
try {
  const config = require('./config.json');
  if (config.tokens && config.tokens[0] === 'DISCORD_BOT_TOKEN') {
    warnings.push('config.json has placeholder tokens - update before running on VPS');
  }
  if (config.owners && config.owners[0] === 'DISCORD_OWNER_ID') {
    warnings.push('config.json has placeholder owner ID - update before running on VPS');
  }
  console.log('  OK: config.json is valid JSON');
} catch (e) {
  errors.push('config.json is missing or invalid');
}

console.log('[4/5] Checking image.js module...');
const imagePath = './autosecure/utils/assets/image/image.js';
if (fs.existsSync(path.join(__dirname, 'autosecure/utils/assets/image/image.js'))) {
  console.log('  OK: image.js exists');
} else {
  errors.push('image.js module is missing');
}

console.log('[5/5] Checking autosecure modules...');
const autosecureModules = [
  './autosecure/autosecure',
  './autosecure/utils/generate',
];
for (const mod of autosecureModules) {
  try {
    require.resolve(mod);
    console.log(`  OK: ${mod}`);
  } catch (e) {
    errors.push(`Module not found: ${mod}`);
  }
}

console.log('');
console.log('='.repeat(60));
console.log('VALIDATION RESULTS');
console.log('='.repeat(60));

if (errors.length > 0) {
  console.log('');
  console.log('ERRORS:');
  errors.forEach(e => console.log(`  - ${e}`));
}

if (warnings.length > 0) {
  console.log('');
  console.log('WARNINGS:');
  warnings.forEach(w => console.log(`  - ${w}`));
}

if (errors.length === 0) {
  console.log('');
  console.log('SUCCESS: All code validation checks passed!');
  console.log('');
  console.log('NEXT STEPS:');
  console.log('  1. Download this project to your VPS');
  console.log('  2. Update config.json with your real values:');
  console.log('     - Discord bot token');
  console.log('     - Discord owner ID');
  console.log('     - Domain name');
  console.log('     - Other required settings');
  console.log('  3. Run: npm install');
  console.log('  4. Run: node autosecure.js');
  console.log('     Or with PM2: pm2 start autosecure.js --name autosecure');
  console.log('');
  console.log('NOTE: This bot requires a VPS with:');
  console.log('  - Port 25 open for SMTP email receiving');
  console.log('  - A purchased domain pointed to your VPS');
  console.log('  - Node.js 18+ (or the polyfill will handle compatibility)');
} else {
  console.log('');
  console.log('FAILED: Please fix the errors above before deploying.');
  process.exit(1);
}

console.log('');
console.log('='.repeat(60));
