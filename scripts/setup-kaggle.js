#!/usr/bin/env node

/**
 * Setup Kaggle API credentials
 * Copies kaggle.json to ~/.kaggle/ and sets proper permissions
 */

import { readFileSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const kaggleJsonPath = join(process.cwd(), 'supabase', 'secrets', 'kaggle.json');
const kaggleDir = join(homedir(), '.kaggle');
const kaggleJsonDest = join(kaggleDir, 'kaggle.json');

try {
  // Read the kaggle.json file
  const kaggleData = readFileSync(kaggleJsonPath, 'utf8');
  
  // Create .kaggle directory if it doesn't exist
  mkdirSync(kaggleDir, { recursive: true });
  
  // Write kaggle.json to ~/.kaggle/
  writeFileSync(kaggleJsonDest, kaggleData);
  
  // Set permissions to 600 (read/write for owner only)
  chmodSync(kaggleJsonDest, 0o600);
  
  console.log('✅ Kaggle credentials set up successfully!');
  console.log(`   Credentials copied to: ${kaggleJsonDest}`);
  console.log('\n📝 Environment variables to set:');
  console.log('   export KAGGLE_USERNAME=chekerh');
  console.log('   export KAGGLE_KEY=3f5bb9133ca51bf7071c69dd2d8317f6');
} catch (error) {
  console.error('❌ Error setting up Kaggle credentials:', error.message);
  process.exit(1);
}

