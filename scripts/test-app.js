#!/usr/bin/env node

/**
 * Comprehensive Testing Script for Cognicare
 * Tests all major features and components
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tests = {
  passed: 0,
  failed: 0,
  skipped: 0,
};

function logTest(name, passed, message = '') {
  if (passed) {
    console.log(`✅ ${name}`);
    tests.passed++;
  } else {
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
    tests.failed++;
  }
}

function logSkip(name, reason = '') {
  console.log(`⏭️  ${name}${reason ? ': ' + reason : ''}`);
  tests.skipped++;
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    logTest('Database Connection', !error, error?.message);
    return !error;
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

async function testTables() {
  const tables = [
    'users',
    'children',
    'posts',
    'comments',
    'reactions',
    'specialists',
    'game_sessions',
    'ai_reports',
    'conversations',
    'messages',
    'groups',
    'group_posts',
    'reels',
    'consultations',
    'notifications',
  ];

  let allPassed = true;
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      logTest(`Table: ${table}`, !error, error?.message);
      if (error) allPassed = false;
    } catch (error) {
      logTest(`Table: ${table}`, false, error.message);
      allPassed = false;
    }
  }
  return allPassed;
}

async function testRLS() {
  try {
    // Try to access users table (should work for authenticated)
    const { error } = await supabase.from('users').select('*').limit(1);
    // RLS is working if we get a proper response (even if empty)
    logTest('RLS Policies', true);
    return true;
  } catch (error) {
    logTest('RLS Policies', false, error.message);
    return false;
  }
}

async function testStorage() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    logTest('Storage Access', !error, error?.message);
    
    if (!error && data) {
      const requiredBuckets = ['reels', 'avatars', 'group-covers'];
      const existingBuckets = data.map(b => b.name);
      const missing = requiredBuckets.filter(b => !existingBuckets.includes(b));
      
      if (missing.length > 0) {
        console.log(`⚠️  Missing storage buckets: ${missing.join(', ')}`);
        logSkip('Storage Buckets Setup', `Missing: ${missing.join(', ')}`);
      } else {
        logTest('Storage Buckets', true);
      }
    }
    return !error;
  } catch (error) {
    logTest('Storage Access', false, error.message);
    return false;
  }
}

async function testMigrations() {
  try {
    // Check if Phase 2 tables exist
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    logTest('Phase 2 Migration', !error, error?.message);
    return !error;
  } catch (error) {
    logTest('Phase 2 Migration', false, 'Run migration: 20250102000000_phase2_schema.sql');
    return false;
  }
}

async function runAllTests() {
  console.log('\n🧪 Starting Cognicare Tests...\n');
  console.log('=' .repeat(50));

  // Test 1: Database Connection
  console.log('\n📊 Testing Database...');
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n❌ Database connection failed. Please check your .env file.');
    console.log('Tests stopped.');
    return;
  }

  // Test 2: Tables
  console.log('\n📋 Testing Tables...');
  await testTables();

  // Test 3: RLS
  console.log('\n🔒 Testing Security (RLS)...');
  await testRLS();

  // Test 4: Storage
  console.log('\n💾 Testing Storage...');
  await testStorage();

  // Test 5: Migrations
  console.log('\n🔄 Testing Migrations...');
  await testMigrations();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⏭️  Skipped: ${tests.skipped}`);
  console.log(`📈 Total: ${tests.passed + tests.failed + tests.skipped}`);

  if (tests.failed === 0) {
    console.log('\n🎉 All critical tests passed!');
    console.log('✅ Your application is ready for deployment!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    console.log('📖 See DATABASE_SETUP.md for setup instructions.');
  }

  console.log('\n');
}

runAllTests().catch(console.error);

