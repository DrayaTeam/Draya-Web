const http = require('http');

const data = JSON.stringify({
  email: 'recon_student_001@example.com',
  password: 'StrongPassword123!'
});

const req = http.request({
  hostname: 'draya-api.runasp.net',
  port: 80,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  });
});

req.on('error', console.error);
req.write(data);
req.end();
