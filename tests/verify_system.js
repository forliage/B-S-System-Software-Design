const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:13000/api';
const TEST_USER = {
    username: 'autotest_' + Date.now(),
    email: `autotest_${Date.now()}@example.com`,
    password: 'password123'
};

let authToken = null;
let uploadedPhotoId = null;

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const log = (msg, type = 'info') => {
    const color = type === 'pass' ? colors.green : type === 'fail' ? colors.red : colors.blue;
    console.log(`${color}[${type.toUpperCase()}] ${msg}${colors.reset}`);
};

async function runTests() {
    console.log('Starting System Verification...');

    // 1. Authentication
    try {
        log('Testing Registration...');
        await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
        log('Registration Passed', 'pass');

        log('Testing Login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: TEST_USER.username,
            password: TEST_USER.password
        });
        authToken = loginRes.data.token;
        if (!authToken) throw new Error('No token received');
        log('Login Passed', 'pass');

        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        log('Testing Get Current User...');
        const meRes = await axios.get(`${BASE_URL}/auth/me`);
        if (meRes.data.username !== TEST_USER.username) throw new Error('User mismatch');
        log('Get Me Passed', 'pass');

    } catch (e) {
        log(`Auth Failed: ${e.response?.data?.error || e.message}`, 'fail');
        process.exit(1);
    }

    // 2. Photo Management
    try {
        log('Testing Photo Upload...');
        // Create a dummy image
        const buffer = Buffer.from('fake image content');
        const form = new FormData();
        form.append('image', buffer, { filename: 'test_image.jpg', contentType: 'image/jpeg' });
        form.append('title', 'Test Photo');
        form.append('description', 'This is a test photo');
        form.append('tags', 'test, automated');

        const uploadRes = await axios.post(`${BASE_URL}/photos`, form, {
            headers: { ...form.getHeaders() }
        });
        uploadedPhotoId = uploadRes.data.photo_id;
        log('Photo Upload Passed', 'pass');

        log('Testing Get Photo List...');
        const listRes = await axios.get(`${BASE_URL}/photos`);
        if (!listRes.data.find(p => p.photo_id === uploadedPhotoId)) throw new Error('Uploaded photo not in list');
        log('Get List Passed', 'pass');

        log('Testing Get Photo Details...');
        const detailRes = await axios.get(`${BASE_URL}/photos/${uploadedPhotoId}`);
        if (detailRes.data.title !== 'Test Photo') throw new Error('Details mismatch');
        log('Get Details Passed', 'pass');

    } catch (e) {
        log(`Photo Management Failed: ${e.response?.data?.error || e.message}`, 'fail');
    }

    // 3. Social Interactions
    if (uploadedPhotoId) {
        try {
            log('Testing Like Photo...');
            await axios.post(`${BASE_URL}/photos/${uploadedPhotoId}/like`);
            const likeCheck = await axios.get(`${BASE_URL}/photos/${uploadedPhotoId}`);
            if (likeCheck.data.like_count !== 1) throw new Error('Like count mismatch');
            log('Like Photo Passed', 'pass');

            // Toggle like off
            await axios.post(`${BASE_URL}/photos/${uploadedPhotoId}/like`);

            log('Testing Comment...');
            // Check if comment route exists (it was added in server code)
            await axios.post(`${BASE_URL}/photos/${uploadedPhotoId}/comments`, { content: 'Nice photo!' });
            const commentCheck = await axios.get(`${BASE_URL}/photos/${uploadedPhotoId}`);
            if (!commentCheck.data.comments || commentCheck.data.comments.length === 0) throw new Error('Comment not saved');
            log('Comment Passed', 'pass');

        } catch (e) {
            log(`Social Failed: ${e.response?.data?.error || e.message}`, 'fail');
        }
    }

    // 4. AI Features (Endpoint check only)
    try {
        log('Testing AI Endpoint Accessibility...');
        // Without API Key, it might return 503 or error, but we check if endpoint is reachable
        try {
            await axios.post(`${BASE_URL}/ai/chat`, { query: 'test' });
        } catch (e) {
            // 503 is expected without key, 404 is bad
            if (e.response && e.response.status === 404) throw new Error('AI Route not found');
            log('AI Endpoint Reachable (Returns error as expected without key)', 'pass');
        }
    } catch (e) {
        log(`AI Check Failed: ${e.message}`, 'fail');
    }

    // 5. Cleanup
    if (uploadedPhotoId) {
        try {
            log('Testing Delete Photo...');
            await axios.delete(`${BASE_URL}/photos/${uploadedPhotoId}`);
            try {
                await axios.get(`${BASE_URL}/photos/${uploadedPhotoId}`);
                log('Delete Failed (Photo still exists)', 'fail');
            } catch (e) {
                if (e.response?.status === 404) log('Delete Passed', 'pass');
                else throw e;
            }
        } catch (e) {
            log(`Cleanup Failed: ${e.message}`, 'fail');
        }
    }

    console.log('\nAll Tests Completed.');
}

runTests();
