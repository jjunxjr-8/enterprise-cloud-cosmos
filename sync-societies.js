import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncSocieties() {
  try {
    const rawData = fs.readFileSync('./data.json', 'utf8');
    const societies = JSON.parse(rawData);

    const currentNames = [...new Set(societies.map(item => item['society-name']).filter(Boolean))];
    const formattedRows = currentNames.map(name => ({ 'society-name': name }));

    console.log(`Found ${formattedRows.length} societies in data.json.`);

    // 1. Clear table and reset ID sequence back to 1 using the RPC function we created
    const { error: resetError } = await supabase.rpc('reset_society_names_sequence');

    if (resetError) {
      console.error('Error resetting society-names:', resetError.message);
      return;
    }

    // 2. Insert the fresh list of names
    const { error: insertError } = await supabase
      .from('society-names')
      .insert(formattedRows);

    if (insertError) {
      console.error('Error inserting new societies:', insertError.message);
      return;
    }

    console.log('Successful');
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

syncSocieties();
