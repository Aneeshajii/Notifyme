const jwt = require('jsonwebtoken');
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
// I need the JWT secret. Let's assume it's 'secret' or whatever is in .env
require('dotenv').config({ path: 'C:/Users/anees/OneDrive/Desktop/email/ringme-backend/.env' });

const token = jwt.sign({ id: '864b917f-a68a-4a7d-b1ed-81227364e437', role: 'MASTER_ADMIN' }, process.env.JWT_SECRET || 'secret');

axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

async function test() {
    try {
        console.log("Fetching /audit-logs...");
        const auditRes = await axios.get(`${API_BASE}/auth/audit-logs`);
        console.log("Audit Logs OK, length:", auditRes.data.length);

        console.log("Fetching /tags/admin/all...");
        const tagRes = await axios.get(`${API_BASE}/tags/admin/all`);
        console.log("Tags OK, length:", tagRes.data.length);

        console.log("Fetching /auth/users...");
        const userRes = await axios.get(`${API_BASE}/auth/users`);
        console.log("Users OK, length:", userRes.data.length);

        console.log("Fetching /subscriptions...");
        const subRes = await axios.get(`${API_BASE}/subscriptions`);
        console.log("Subscriptions OK, length:", subRes.data.length);

        console.log("Fetching /auth/sessions...");
        const sessionsRes = await axios.get(`${API_BASE}/auth/sessions`);
        console.log("Sessions OK, length:", sessionsRes.data.length);

    } catch (err) {
        console.error("ERROR:", err.response ? err.response.data : err.message);
    }
}
test();
