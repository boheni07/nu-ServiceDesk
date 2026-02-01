import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Fetching one company...");
    const { data, error } = await supabase.from('companies').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Company Keys:", Object.keys(data[0]));
        console.log("Sample:", data[0]);
    } else {
        console.log("No companies found. Attempting to insert dummy to see error if any, or just empty.");
        // If empty, we can't see keys easily without strict schema query which requires rpc or admin.
        // But we can try to insert with 'registration_number' and see if it fails.
    }
}

inspect();
