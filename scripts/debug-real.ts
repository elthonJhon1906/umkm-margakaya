// scripts/debug-real.ts
import { createClient } from '@supabase/supabase-js';

// ⭐⭐⭐ PAKAI CREDENTIALS ANDA LANGSUNG DI SINI ⭐⭐⭐
const SUPABASE_URL = 'https://idunloffuvlackboopge.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdW5sb2ZmdXZsYWNrYm9vcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODUyMjgsImV4cCI6MjA4NDg2MTIyOH0.f_1R_tfF3Y1Ojjh9AZt5qmklvsNwzur2OnateGBfH_M';

console.log('🔧 SUPABASE CONNECTION TEST');
console.log('===========================\n');
console.log('URL:', SUPABASE_URL);
console.log('Key length:', SUPABASE_KEY.length);

async function testConnection() {
  try {
    // 1. Create client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('\n✅ Supabase client created');
    
    // 2. Test basic query
    console.log('📡 Testing connection to admin table...');
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ QUERY ERROR:', error.message);
      
      // Analyze specific errors
      if (error.code === '42P01') {
        console.log('\n💡 TABLE NOT FOUND!');
        console.log('The "admin" table does not exist in your database.');
        console.log('\nGo to Supabase Dashboard → SQL Editor and run:');
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
      } else if (error.message.includes('JWT')) {
        console.log('\n🔑 AUTHENTICATION ERROR');
        console.log('Check if your anon key is valid.');
      } else {
        console.log('Error code:', error.code);
        console.log('Error details:', error.details);
      }
    } else {
      console.log('✅ CONNECTION SUCCESSFUL!');
      console.log(`Found ${data?.length || 0} admin records`);
      
      if (data && data.length > 0) {
        console.log('\n📋 ADMIN DATA:');
        console.table(data);
        
        // Check for admin/admin123
        const adminUser = data.find((u: any) => 
          u.username === 'admin' && u.password === 'admin123'
        );
        
        if (adminUser) {
          console.log('✅ CORRECT: Found admin with password "admin123"');
        } else {
          console.log('❌ PROBLEM: No admin with password "admin123"');
          console.log('Available users:');
          data.forEach((u: any) => {
            console.log(`  - ${u.username}: ${u.password}`);
          });
        }
      }
    }
    
  } catch (err: any) {
    console.error('💥 UNEXPECTED ERROR:', err.message);
    console.error('Stack:', err.stack);
  }
}

testConnection();