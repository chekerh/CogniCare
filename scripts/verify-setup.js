#!/usr/bin/env node

/**
 * Cognicare Setup Verification Script
 * Checks if database, environment, and dependencies are properly configured
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
  return `${colors.green}✓${colors.reset}`;
}

function cross() {
  return `${colors.red}✗${colors.reset}`;
}

async function checkEnvironment() {
  log('\n📋 Checking Environment Variables...', 'blue');
  
  const envPath = path.join(__dirname, '..', '.env');
  let envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    log(`${cross()} .env file not found`, 'red');
    log('   Create .env file with: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_AI_SERVER_URL', 'yellow');
    return false;
  }
  
  log(`${checkmark()} .env file exists`, 'green');
  
  // Try to read env (won't work with VITE_ prefix, but we can check file)
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  const hasAiServer = envContent.includes('VITE_AI_SERVER_URL');
  
  if (!hasSupabaseUrl) {
    log(`${cross()} VITE_SUPABASE_URL not found in .env`, 'red');
    return false;
  }
  log(`${checkmark()} VITE_SUPABASE_URL found`, 'green');
  
  if (!hasSupabaseKey) {
    log(`${cross()} VITE_SUPABASE_ANON_KEY not found in .env`, 'red');
    return false;
  }
  log(`${checkmark()} VITE_SUPABASE_ANON_KEY found`, 'green');
  
  if (!hasAiServer) {
    log(`${cross()} VITE_AI_SERVER_URL not found in .env`, 'yellow');
    log('   AI server is optional, but recommended', 'yellow');
  } else {
    log(`${checkmark()} VITE_AI_SERVER_URL found`, 'green');
  }
  
  return true;
}

async function checkDatabase() {
  log('\n🗄️  Checking Database Connection...', 'blue');
  
  try {
    // Load env vars (simplified - in real app, use dotenv)
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      log(`${cross()} Cannot check database - .env file missing`, 'red');
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
    
    if (!urlMatch || !keyMatch) {
      log(`${cross()} Cannot parse Supabase credentials from .env`, 'red');
      return false;
    }
    
    const supabaseUrl = urlMatch[1].trim();
    const supabaseKey = keyMatch[1].trim();
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      log(`${cross()} Database connection failed: ${error.message}`, 'red');
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        log('   → Run database migrations first!', 'yellow');
      }
      return false;
    }
    
    log(`${checkmark()} Database connection successful`, 'green');
    
    // Check required tables
    const requiredTables = ['users', 'children', 'posts', 'groups', 'reels', 'messages'];
    let allTablesExist = true;
    
    for (const table of requiredTables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(1);
      if (tableError) {
        log(`${cross()} Table '${table}' not accessible: ${tableError.message}`, 'red');
        allTablesExist = false;
      } else {
        log(`${checkmark()} Table '${table}' exists`, 'green');
      }
    }
    
    return allTablesExist;
    
  } catch (error) {
    log(`${cross()} Database check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'blue');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`${cross()} package.json not found`, 'red');
    return false;
  }
  
  log(`${checkmark()} package.json exists`, 'green');
  
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log(`${cross()} node_modules not found - run 'npm install'`, 'red');
    return false;
  }
  
  log(`${checkmark()} node_modules exists`, 'green');
  
  // Check key dependencies
  const keyDeps = ['react', '@supabase/supabase-js', 'lucide-react'];
  for (const dep of keyDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      log(`${checkmark()} ${dep} installed`, 'green');
    } else {
      log(`${cross()} ${dep} not found - run 'npm install'`, 'red');
      return false;
    }
  }
  
  return true;
}

async function checkAIServer() {
  log('\n🤖 Checking AI Server...', 'blue');
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const aiServerMatch = envContent.match(/VITE_AI_SERVER_URL=(.+)/);
  
  if (!aiServerMatch) {
    log(`${cross()} AI server URL not configured (optional)`, 'yellow');
    return true; // Optional
  }
  
  const aiServerUrl = aiServerMatch[1].trim();
  
  try {
    const response = await fetch(`${aiServerUrl}/health`);
    if (response.ok) {
      const data = await response.json();
      log(`${checkmark()} AI server is running: ${data.status}`, 'green');
      return true;
    } else {
      log(`${cross()} AI server returned error: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`${cross()} AI server not reachable: ${error.message}`, 'yellow');
    log('   → AI server is optional - app works without it', 'yellow');
    return true; // Optional, don't fail
  }
}

async function main() {
  log('\n🚀 Cognicare Setup Verification', 'blue');
  log('=' .repeat(50), 'blue');
  
  const results = {
    environment: await checkEnvironment(),
    dependencies: await checkDependencies(),
    database: await checkDatabase(),
    aiServer: await checkAIServer(),
  };
  
  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 Summary:', 'blue');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  Object.entries(results).forEach(([check, passed]) => {
    const icon = passed ? checkmark() : cross();
    const status = passed ? 'PASS' : 'FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${icon} ${check}: ${status}`, color);
  });
  
  if (allPassed) {
    log('\n✅ All checks passed! App is ready to run.', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Run: npm run dev', 'yellow');
    log('  2. Open: http://localhost:5173', 'yellow');
    log('  3. Create an account and test!', 'yellow');
  } else {
    log('\n❌ Some checks failed. Please fix the issues above.', 'red');
    log('\nCommon fixes:', 'blue');
    log('  - Missing .env: Create .env file with Supabase credentials', 'yellow');
    log('  - Database errors: Run migrations in Supabase SQL Editor', 'yellow');
    log('  - Missing dependencies: Run npm install', 'yellow');
  }
  
  log('\n');
}

main().catch(console.error);

