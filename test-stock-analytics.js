// Stock Analytics performance test script
const http = require('http');

function request(path) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3000, path, method: 'GET' }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const durationMs = Date.now() - startedAt;
        try {
          const json = JSON.parse(body || '{}');
          resolve({ status: res.statusCode, ms: durationMs, ok: res.statusCode >= 200 && res.statusCode < 300, json });
        } catch (e) {
          resolve({ status: res.statusCode, ms: durationMs, ok: false, error: 'Invalid JSON' });
        }
      });
    });
    req.on('error', err => reject(err));
    req.setTimeout(14000, () => {
      req.destroy(new Error('Client timeout after 14s'));
    });
    req.end();
  });
}

(async () => {
  console.log('Running stock analytics API performance test...');
  const pages = [1, 2, 3, 4, 5];

  // Sequential test (pages 1..5)
  console.log('Sequential test (full mode pages 1..5)');
  for (const page of pages) {
    const path = `/api/dashboard/stock-analytics?page=${page}&limit=25&mode=full`;
    try {
      const result = await request(path);
      console.log(JSON.stringify({ path, mode: 'full', status: result.status, ms: result.ms, ok: result.ok, products: result.json.products ? result.json.products.length : 0, success: result.json.success, error: result.json.error || null }));
    } catch (e) {
      console.error(JSON.stringify({ path, mode: 'full', ok: false, error: e.message }));
    }
  }

  // Fast mode quick pass
  console.log('Fast mode quick pass (pages 1..2)');
  for (const page of [1, 2]) {
    const path = `/api/dashboard/stock-analytics?page=${page}&limit=25&mode=fast`;
    try {
      const result = await request(path);
      console.log(JSON.stringify({ path, mode: 'fast', status: result.status, ms: result.ms, ok: result.ok, products: result.json.products ? result.json.products.length : 0, success: result.json.success, error: result.json.error || null }));
    } catch (e) {
      console.error(JSON.stringify({ path, mode: 'fast', ok: false, error: e.message }));
    }
  }

  // Concurrency test (4 requests in parallel)
  console.log('Concurrency test (4 parallel full mode requests)');
  const parallelPages = [6, 7, 8, 9];
  const promises = parallelPages.map(page => {
    const path = `/api/dashboard/stock-analytics?page=${page}&limit=25&mode=full`;
    return request(path).then(result => ({ path, mode: 'full', status: result.status, ms: result.ms, ok: result.ok, products: result.json.products ? result.json.products.length : 0, success: result.json.success, error: result.json.error || null })).catch(e => ({ path, mode: 'full', ok: false, error: e.message }));
  });
  const results = await Promise.all(promises);
  results.forEach(r => console.log(JSON.stringify(r)));
})();