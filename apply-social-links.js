const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://wpsmgfulrugrsabgcdmp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Read SQL from file
const sqlFile = path.join(__dirname, 'supabase-links-schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('\n🔑 Get your Service Role Key from:');
  console.error('https://wpsmgfulrugrsabgcdmp.supabase.co/project/_/settings/api');
  console.error('\nThen run: export SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.error('\n--- OR apply manually ---');
  console.log('\n📋 Copy this SQL and run it in the Supabase SQL Editor:');
  console.log('https://wpsmgfulrugrsabgcdmp.supabase.co/project/_/sql');
  console.log('\n' + '='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applying social_links schema...\n');
  
  try {
    // Try using exec_sql RPC function
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ social_links table created successfully!');
    console.log('✅ link_clicks table created successfully!');
    console.log('✅ RLS policies applied!');
    console.log('\n🎉 All done! The 500 errors on /api/links should be fixed.');
  } catch (err) {
    console.error('❌ Could not apply migration automatically:', err.message);
    console.log('\n📋 Please copy this SQL and run it manually in the Supabase SQL Editor:');
    console.log('https://wpsmgfulrugrsabgcdmp.supabase.co/project/_/sql\n');
    console.log('='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));
  }
}

applyMigration();
