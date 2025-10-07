import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

let page = 1;
let totalDeleted = 0;

while (true) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) { console.error(error.message); process.exit(1); }
  if (!data?.users?.length) break;
  for (const u of data.users) {
    if (!u.email) continue;
    const del = await admin.auth.admin.deleteUser(u.id);
    if (del.error) { console.log(`Failed ${u.email}: ${del.error.message}`); }
    else { totalDeleted++; }
  }
  page++;
}

console.log(`Deleted users: ${totalDeleted}`);
