const { createClient } = require('@supabase/supabase-js');
const path = require('path');

//loads .env variables from the root proj. directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUri = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUri || !supabaseKey)
    console.error('Missing Supabase .env variables!');

const supabase = createClient(supabaseUri, supabaseKey);

module.exports = supabase;