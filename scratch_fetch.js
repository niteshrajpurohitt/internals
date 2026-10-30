const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://mrcbijsogojyagydkqno.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY2JpanNvZ29qeWFneWRrcW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM0NjI0MCwiZXhwIjoyMTAxOTIyMjQwfQ.UPmy2yql8kXuaVcBnFIcnPx22pLmlJ7Z2e8UjCOeVtY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  let allPosts = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, summary, source_url, tags, read_time, published_at, companies ( name, slug )')
      .order('published_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Fetch error:', error);
      break;
    }
    if (!data || data.length === 0) break;
    allPosts = allPosts.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Total posts fetched: ${allPosts.length}`);
  fs.writeFileSync('scratch_posts.json', JSON.stringify(allPosts, null, 2));

  // Let's also print summary stats
  const companies = {};
  for (const p of allPosts) {
    const compName = p.companies?.name || 'Unknown';
    companies[compName] = (companies[compName] || 0) + 1;
  }
  console.log('Posts per company:', companies);
}

main().catch(console.error);
