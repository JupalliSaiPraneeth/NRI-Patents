import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY is missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Compatibility wrapper for simple queries (optional, but routers will be updated to use supabase directly)
export const db = {
  query: async (sql, params = []) => {
    console.warn('⚠️ db.query is deprecated. Use supabase client directly.');
    // This is just a placeholder to prevent immediate crashes before routers are updated
    throw new Error('Direct SQL queries are not supported with Supabase client. Please update to use supabase.from().');
  }
};

// Database initialization (tables should be created via Supabase SQL Editor)
export const dbReady = (async () => {
  try {
    const { data, error } = await supabase.from('admins').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
      return;
    }
    console.log('✅ Connected to Supabase');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
})();
