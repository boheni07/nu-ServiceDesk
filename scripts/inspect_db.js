import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/"/g, ''); // Simple unquote
                env[key] = val;
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Fetching one company...");
    const { data, error } = await supabase.from('companies').select('*').limit(1);

    if (error) {
        console.error("Error fetching companies:", error);
    } else if (data && data.length > 0) {
        console.log("Company Keys:", Object.keys(data[0]));
        console.log("Sample Data:", data[0]);
    } else {
        console.log("No companies found. Attempting insert to test columns...");
        // Try inserting with 'business_number'
        const testId = `test-${Date.now()}`;
        const { error: insertErr } = await supabase.from('companies').insert([{
            id: testId,
            name: 'Test Schema',
            status: 'ACTIVE',
            business_number: '123'
        }]);

        if (insertErr) {
            console.log("Insert with business_number failed:", insertErr.message);
            // Try registration_number
            const { error: insertErr2 } = await supabase.from('companies').insert([{
                id: testId + '2',
                name: 'Test Schema 2',
                status: 'ACTIVE',
                registration_number: '123'
            }]);
            if (insertErr2) console.log("Insert with registration_number failed:", insertErr2.message);
            else console.log("Insert with registration_number SUCCESS");
        } else {
            console.log("Insert with business_number SUCCESS");
        }
    }
}

inspect();
