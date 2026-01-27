import { createClient } from '@supabase/supabase-js';

// Debug: cek environment variables
console.log('🔧 ENV Check:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
});

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/2.39.0'
      }
    }
  }
);

// Test function untuk cek bucket
export const testBucketConnection = async () => {
  console.log('🔄 Testing bucket connection...');
  
  try {
    // Coba list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ List buckets error:', listError);
      return false;
    }
    
    console.log('✅ Available buckets:', buckets);
    
    // Cari bucket umkm-images
    const bucketExists = buckets?.some(bucket => bucket.name === 'umkm-images');
    
    if (bucketExists) {
      console.log('✅ Found bucket: umkm-images');
      
      // Coba get bucket detail
      const { data: bucketDetail, error: detailError } = await supabase.storage.getBucket('umkm-images');
      
      if (detailError) {
        console.error('❌ Get bucket detail error:', detailError);
      } else {
        console.log('✅ Bucket details:', bucketDetail);
      }
      
      return true;
    } else {
      console.error('❌ Bucket "umkm-images" not found in:', buckets?.map(b => b.name));
      return false;
    }
  } catch (error) {
    console.error('💥 Bucket test failed:', error);
    return false;
  }
};