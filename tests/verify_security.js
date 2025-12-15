const axios = require('axios');
const BASE_URL = 'http://127.0.0.1:13000/api';

const log = (msg, type = 'info') => {
    const color = type === 'pass' ? "\x1b[32m" : type === 'fail' ? "\x1b[31m" : "\x1b[34m";
    console.log(`${color}[${type.toUpperCase()}] ${msg}\x1b[0m`);
};

async function runSecurityTests() {
    console.log('Starting Security Verification...');

    // 1. XSS Test (Script Injection)
    log('Testing XSS Protection...');
    try {
        // Create user for test
        const testUser = { username: 'xsstest_' + Date.now(), email: `xss_${Date.now()}@test.com`, password: 'password' };
        await axios.post(`${BASE_URL}/auth/register`, testUser);
        const login = await axios.post(`${BASE_URL}/auth/login`, { username: testUser.username, password: testUser.password });
        const token = login.data.token;

        // Try injecting script in photo title
        const FormData = require('form-data');
        const buffer = Buffer.from('fake image');
        const form = new FormData();
        form.append('image', buffer, { filename: 'xss.jpg', contentType: 'image/jpeg' });
        form.append('title', '<script>alert("XSS")</script>Photo'); // Malicious Input
        form.append('description', 'Normal desc');

        const upload = await axios.post(`${BASE_URL}/photos`, form, {
            headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` }
        });

        const photoId = upload.data.photo_id;
        const photo = await axios.get(`${BASE_URL}/photos/${photoId}`);

        // Assert: Input should be sanitized or script tags removed/encoded
        // xss-clean usually converts < to &lt; or removes them
        if (photo.data.title.includes('<script>')) {
            log('XSS Check Failed (Script tag persisted)', 'fail');
        } else {
            log(`XSS Check Passed (Sanitized: ${photo.data.title})`, 'pass');
        }

    } catch (e) {
        log(`XSS Test Error: ${e.message}`, 'fail');
    }

    // 2. SQL Injection Test
    log('Testing SQL Injection...');
    try {
        // Try common SQL injection payload in login
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                username: "' OR '1'='1",
                password: "' OR '1'='1"
            });
            log('SQL Injection Failed (Login succeeded with injection payload - BAD)', 'fail');
        } catch (e) {
            if (e.response && e.response.status === 401) {
                log('SQL Injection Passed (Login rejected invalid credentials)', 'pass');
            } else {
                log(`SQL Injection response: ${e.response?.status}`, 'pass');
            }
        }
    } catch (e) {
        log(`SQL Injection Test Error: ${e.message}`, 'fail');
    }

    // 3. Rate Limiting Test (DoS Simulation)
    // Run LAST because it consumes the request quota
    log('Testing Rate Limiting (Brute Force Simulation)...');
    try {
        let blocked = false;
        // Send 105 requests (limit is 100)
        const requests = [];
        for (let i = 0; i < 110; i++) {
            requests.push(axios.get(`${BASE_URL}/photos`).catch(e => e.response));
        }

        const responses = await Promise.all(requests);
        const tooManyReq = responses.find(r => r && r.status === 429);

        if (tooManyReq) {
            log('Rate Limiting Passed (Blocked excess requests)', 'pass');
        } else {
            log('Rate Limiting Failed (Did not block requests)', 'fail');
        }
    } catch (e) {
        log(`Rate Limit Test Error: ${e.message}`, 'fail');
    }
}

runSecurityTests();
