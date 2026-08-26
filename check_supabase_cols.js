const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mekibdmvpkkujqpfqwyt.supabase.co', 'sb_publishable_RSAj2n6JVAg9X6P8UFyTDA_AvhjlwDX');

async function checkCols() {
  const { data, error } = await supabase.from('customer').select('*').limit(1);
  if (error) console.log(error);
  else console.log("Customer sample:", data[0]);

  const { data: subData, error: subErr } = await supabase.from('customer_detail').select('*').limit(1);
  if (subErr) console.log(subErr);
  else console.log("Customer_detail sample:", subData[0]);
}

checkCols();
