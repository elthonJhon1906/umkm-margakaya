// scripts/debug-admin.ts
import { supabase } from '@/lib/supabase';

async function debugAdminTable() {
  console.log('🔍 Debugging Admin Table...');
  console.log('=============================\n');
  
  try {
    // 0. Cek konfigurasi supabase
    console.log('0. Checking Supabase configuration...');
    console.log('Supabase URL:', (supabase as any).supabaseUrl || 'Not accessible');
    console.log('Database: umkm-margakaya');
    
    // 1. Coba cek apakah tabel admin ada
    console.log('\n1. Checking if "admin" table exists...');
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('admin')
        .select('*')
        .limit(1);
      
      if (tableError) {
        if (tableError.code === '42P01' || tableError.message.includes('does not exist')) {
          console.log('❌ Table "admin" does not exist in database');
          console.log('\n💡 Solution: Create the table first with:');
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
          
          // Coba cek tabel lain yang mungkin ada
          await checkOtherTables();
          return;
        } else {
          console.error('❌ Table access error:', tableError);
          console.log('Error code:', tableError.code);
          console.log('Error details:', tableError.details);
        }
      } else {
        console.log('✅ Table "admin" exists');
        console.log(`Found ${tableCheck?.length || 0} records`);
      }
    } catch (err: any) {
      console.error('💥 Error checking table:', err.message);
    }
    
    // 2. Jika tabel ada, lanjutkan dengan query
    console.log('\n2. Counting total records...');
    try {
      const { count, error: countError } = await supabase
        .from('admin')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Count error:', countError);
      } else {
        console.log(`📊 Total admin records: ${count || 0}`);
      }
    } catch (err: any) {
      console.error('💥 Count query error:', err.message);
    }
    
    // 3. Lihat semua data di tabel admin
    console.log('\n3. Fetching all admin data...');
    try {
      const { data: allAdmins, error: fetchError } = await supabase
        .from('admin')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
      } else {
        console.log(`📋 Found ${allAdmins?.length || 0} admin records:`);
        if (allAdmins && allAdmins.length > 0) {
          console.table(allAdmins);
          
          // Cari user 'admin'
          const adminUser = allAdmins.find(u => u.username === 'admin');
          if (adminUser) {
            console.log('\n✅ Found user "admin":');
            console.log('- ID:', adminUser.id);
            console.log('- Password:', adminUser.password);
            console.log('- Created:', adminUser.created_at);
          } else {
            console.log('\n❌ User "admin" not found in retrieved data');
          }
        } else {
          console.log('No data in admin table');
        }
      }
    } catch (err: any) {
      console.error('💥 Fetch all error:', err.message);
    }
    
    // 4. Coba query spesifik untuk username 'admin'
    console.log('\n4. Querying specifically for username "admin"...');
    try {
      const { data: adminUser, error: queryError } = await supabase
        .from('admin')
        .select('*')
        .eq('username', 'admin')
        .maybeSingle(); // Gunakan maybeSingle untuk menghindari error jika tidak ada data
      
      if (queryError) {
        console.error('❌ Specific query error:', queryError);
      } else {
        if (adminUser) {
          console.log('✅ Found admin user:');
          console.log('- ID:', adminUser.id);
          console.log('- Password:', adminUser.password);
          console.log('- Created:', adminUser.created_at);
        } else {
          console.log('❌ No user found with username "admin"');
        }
      }
    } catch (err: any) {
      console.error('💥 Specific query error:', err.message);
    }
    
    // 5. Test login credentials
    console.log('\n5. Testing login with credentials (admin/admin123)...');
    try {
      const { data: loginTest, error: loginError } = await supabase
        .from('admin')
        .select('*')
        .eq('username', 'admin')
        .eq('password', 'admin123')
        .maybeSingle();
      
      if (loginError) {
        console.error('❌ Login query error:', loginError);
      } else {
        if (loginTest) {
          console.log('✅ Login successful! User found:');
          console.log('- ID:', loginTest.id);
          console.log('- Created:', loginTest.created_at);
        } else {
          console.log('❌ Login failed: No user found with username="admin" and password="admin123"');
          console.log('\n💡 Possible issues:');
          console.log('- Username is different');
          console.log('- Password is different');
          console.log('- Data is in different table');
        }
      }
    } catch (err: any) {
      console.error('💥 Login test error:', err.message);
    }
    
    console.log('\n=============================');
    console.log('🔍 Debug completed');
    
  } catch (error: any) {
    console.error('💥 Unexpected error in debug:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Fungsi untuk cek tabel lain yang mungkin berisi data admin
async function checkOtherTables() {
  console.log('\n🔎 Checking other possible tables...');
  
  const possibleTables = ['users', 'administrators', 'accounts', 'admins', 'user', 'admin_users'];
  
  for (const table of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(2);
      
      if (!error) {
        console.log(`\n📋 Found table "${table}" with ${data?.length || 0} records`);
        if (data && data.length > 0) {
          console.log('Sample data:');
          console.table(data);
          
          // Cek struktur kolom
          const firstRow = data[0];
          console.log('Columns in this table:', Object.keys(firstRow));
          
          // Cari kolom yang mirip username/password
          const usernameCol = Object.keys(firstRow).find(key => 
            key.toLowerCase().includes('user') || key.toLowerCase().includes('name')
          );
          const passwordCol = Object.keys(firstRow).find(key => 
            key.toLowerCase().includes('pass')
          );
          
          if (usernameCol && passwordCol) {
            console.log(`✅ Potential admin table found: "${table}"`);
            console.log(`- Username column: ${usernameCol}`);
            console.log(`- Password column: ${passwordCol}`);
          }
        }
      }
    } catch (err) {
      // Table doesn't exist, continue
    }
  }
  
  console.log('\n💡 If no table exists, create one with:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Run the CREATE TABLE query above');
  console.log('3. Run this debug script again');
}

// Tambahkan fungsi untuk test koneksi langsung
async function testDirectConnection() {
  console.log('\n🔌 Testing direct Supabase connection...');
  
  // Jika ingin test dengan koneksi langsung (tanpa @/lib/supabase)
  const SUPABASE_URL = 'https://idunloffuvlackboopge.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdW5sb2ZmdXZsYWNrYm9vcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODUyMjgsImV4cCI6MjA4NDg2MTIyOH0.f_1R_tfF3Y1Ojjh9AZt5qmklvsNwzur2OnateGBfH_M';
  
  const { createClient } = await import('@supabase/supabase-js');
  const directSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const { data, error } = await directSupabase
    .from('admin')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Direct connection error:', error.message);
  } else {
    console.log('Direct connection successful, data:', data);
  }
}

// Jalankan debug
debugAdminTable();

// Opsional: Uncomment untuk test koneksi langsung
// testDirectConnection();