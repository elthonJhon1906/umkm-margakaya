// scripts/debug-admin.ts
import { createClient } from '@supabase/supabase-js';

// Gunakan credentials langsung (sama dengan debug-real.ts)
const SUPABASE_URL = 'https://idunloffuvlackboopge.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdW5sb2ZmdXZsYWNrYm9vcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODUyMjgsImV4cCI6MjA4NDg2MTIyOH0.f_1R_tfF3Y1Ojjh9AZt5qmklvsNwzur2OnateGBfH_M';

async function debugAdminTable() {
  console.log('🔍 Debugging Admin Table Connection...');
  console.log('======================================\n');
  
  console.log('📡 Connection Details:');
  console.log('- URL:', SUPABASE_URL);
  console.log('- Key length:', SUPABASE_KEY.length);
  console.log('- Key starts with:', SUPABASE_KEY.substring(0, 20) + '...');
  console.log('- Database: umkm-margakaya\n');
  
  try {
    // 1. Buat client Supabase dengan timeout
    console.log('1. Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        fetch: (...args) => 
          fetch(...args).catch(err => {
            console.error('❌ Fetch error:', err.message);
            throw err;
          })
      }
    });
    
    console.log('✅ Supabase client created');
    
    // 2. Test koneksi dasar dengan ping
    console.log('\n2. Testing basic connection...');
    try {
      // Coba akses endpoint Supabase
      const pingResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (pingResponse.ok) {
        console.log('✅ Supabase endpoint reachable');
      } else {
        console.log(`⚠️ Supabase responded with status: ${pingResponse.status}`);
      }
    } catch (fetchError: any) {
      console.error('❌ Cannot reach Supabase URL:', fetchError.message);
      console.log('\n💡 Check:');
      console.log('- Internet connection');
      console.log('- URL是否正确 (no typos)');
      console.log('- CORS/network restrictions');
      return;
    }
    
    // 3. Test dengan query sederhana
    console.log('\n3. Testing database query...');
    
    // Coba query yang sangat sederhana dulu
    console.log('   Trying simple select...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('admin')
      .select('*')
      .limit(1);
    
    if (simpleError) {
      console.log('❌ Query error:', simpleError.message);
      console.log('Error code:', simpleError.code);
      console.log('Error details:', simpleError.details);
      
      if (simpleError.code === '42P01') {
        console.log('\n🎯 DIAGNOSIS: Table "admin" does not exist');
        console.log('\n💡 SOLUTION: Create the table first');
        console.log(`
          CREATE TABLE admin (
            id BIGSERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          INSERT INTO admin (username, password) VALUES 
          ('admin', 'admin123');
        `);
      } else if (simpleError.message.includes('JWT')) {
        console.log('\n🔑 AUTH ERROR: Invalid API key');
        console.log('Check if your anon key is still valid');
      } else if (simpleError.message.includes('fetch')) {
        console.log('\n🌐 NETWORK ERROR: Cannot connect to Supabase');
        console.log('- Check internet connection');
        console.log('- Check if Supabase URL is correct');
        console.log('- Try accessing in browser:', SUPABASE_URL);
      }
    } else {
      console.log('✅ Query successful!');
      console.log(`Found ${simpleData?.length || 0} records`);
      if (simpleData && simpleData.length > 0) {
        console.table(simpleData);
      }
    }
    
    // 4. Coba RPC function untuk test koneksi
    console.log('\n4. Testing RPC connection...');
    try {
      // Coba panggil fungsi built-in jika ada
      const { data: rpcData, error: rpcError } = await supabase.rpc('version');
      
      if (rpcError) {
        console.log('⚠️ RPC test failed (normal):', rpcError.message);
      } else {
        console.log('✅ RPC connection successful');
      }
    } catch (rpcErr: any) {
      console.log('⚠️ RPC test:', rpcErr.message);
    }
    
    // 5. Cek tabel yang ada di database
    console.log('\n5. Checking available tables...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(10);
      
      if (tablesError) {
        console.log('⚠️ Cannot query pg_tables:', tablesError.message);
      } else {
        console.log(`📊 Found ${tables?.length || 0} tables in database:`);
        if (tables && tables.length > 0) {
          tables.forEach((table: any, index: number) => {
            console.log(`   ${index + 1}. ${table.tablename}`);
          });
          
          // Cek apakah ada tabel admin
          const hasAdminTable = tables.some((t: any) => 
            t.tablename.toLowerCase() === 'admin'
          );
          
          if (!hasAdminTable) {
            console.log('\n❌ Table "admin" is NOT in the list');
            console.log('You need to create it first!');
          }
        }
      }
    } catch (err: any) {
      console.log('⚠️ Cannot check tables:', err.message);
    }
    
    // 6. Test fetch langsung untuk diagnosa
    console.log('\n6. Direct fetch test...');
    await testDirectFetch();
    
  } catch (error: any) {
    console.error('\n💥 UNEXPECTED ERROR:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if Supabase project is active');
    console.log('2. Check if API keys are valid');
    console.log('3. Check network/firewall settings');
    console.log('4. Try accessing from different network');
  }
}

async function testDirectFetch() {
  const testUrl = `${SUPABASE_URL}/rest/v1/admin?limit=1`;
  console.log('   Fetching:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    console.log('   Response status:', response.status, response.statusText);
    
    if (response.status === 404) {
      console.log('   ℹ️ Table not found (404) - need to create it');
    } else if (response.status === 401) {
      console.log('   🔒 Unauthorized (401) - check API key');
    } else if (response.status === 200) {
      const data = await response.json();
      console.log('   ✅ Success! Data:', data);
    } else {
      console.log('   ⚠️ Unexpected status:', response.status);
      const text = await response.text();
      console.log('   Response:', text.substring(0, 200));
    }
  } catch (error: any) {
    console.error('   ❌ Fetch failed:', error.message);
    console.log('   This indicates a network/connection issue');
  }
}

// Tambahkan timeout untuk mencegah hanging
async function runWithTimeout() {
  const timeout = 10000; // 10 seconds
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout after 10 seconds')), timeout);
  });
  
  try {
    await Promise.race([
      debugAdminTable(),
      timeoutPromise
    ]);
  } catch (error: any) {
    if (error.message.includes('Timeout')) {
      console.error('\n⏰ CONNECTION TIMEOUT');
      console.log('Supabase is not responding within 10 seconds');
      console.log('Possible issues:');
      console.log('- Internet connection problem');
      console.log('- Supabase service down');
      console.log('- Network firewall blocking');
      console.log('\nCheck: https://status.supabase.com/');
    } else {
      throw error;
    }
  }
}

console.log('🚀 Starting debug...\n');
runWithTimeout().catch(console.error);