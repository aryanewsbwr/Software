const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mekibdmvpkkujqpfqwyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_RSAj2n6JVAg9X6P8UFyTDA_AvhjlwDX';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const tables = ['customer', 'customer_detail', 'publication', 'rate', 'hawker', 'region', 'holiday', 'discontinue', 'publishers', 'receipts'];
  for (const t of tables) {
    try {
      const { data, count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`Table '${t}': Error -> ${error.message}`);
      } else {
        console.log(`Table '${t}': Count = ${count}`);
      }
    } catch (err) {
      console.log(`Table '${t}': Exception -> ${err.message}`);
    }
  }
}

test();
