const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing GET /api/publications (Closed & Active count) ---');
  const allRes = await makeRequest('/api/publications?with_rates=true');
  console.log(`Total: ${allRes.data.total}, Active: ${allRes.data.active_count}, Closed: ${allRes.data.closed_count}`);

  const closedRes = await makeRequest('/api/publications?status=closed');
  console.log(`Closed filter returned: ${closedRes.data.publications.length} publications`);
  console.log('Sample closed publication:', closedRes.data.publications[0]);

  console.log('\n--- 2. Testing Adding New Publication with current date rates ---');
  const newPub = {
    is_new: true,
    publica_id: 0,
    public_name: 'TEST DAILY EXPRESS ' + Date.now().toString().slice(-4),
    pub_hindi: 'टेस्ट दैनिक एक्सप्रेस',
    type_p: 'Daily',
    publish_id: 1,
    abrv: 'TDE',
    circulation: 'Morning',
    duration: 'Daily',
    chr_del: 0,
    rates: {
      1: 8.0, 2: 7.0, 3: 7.0, 4: 7.0, 5: 7.0, 6: 7.0, 7: 7.5
    }
  };

  const postRes = await makeRequest('/api/publications', 'POST', newPub);
  console.log('POST Response:', postRes.data.message);
  console.log('Created Pub ID:', postRes.data.publication.publica_id);

  console.log('\n--- 3. Verifying the New Publication has its own rates and NOT Times of India ---');
  const checkRes = await makeRequest(`/api/publications?search=${encodeURIComponent(newPub.public_name)}`);
  const found = checkRes.data.publications[0];
  console.log('Found created pub:', found.public_name, 'ID:', found.publica_id);
  console.log('Current Rates:', found.current_rates);
  console.log('Sunday Rate (should be ₹8):', found.current_rates?.[1]);
  console.log('Monday Rate (should be ₹7):', found.current_rates?.[2]);

  // Clean up the test publication
  console.log('\n--- 4. Cleaning up test publication ---');
  const delRes = await makeRequest(`/api/publications?id=${found.publica_id}`, 'DELETE');
  console.log('Delete Response:', delRes.data.message);
}

run().catch(console.error);
