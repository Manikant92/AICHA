const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
    host: process.env.SUPABASE_DB_HOST,
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    port: process.env.SUPABASE_DB_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupTestUsers() {
    try {
        // Insert test users
        await pool.query(`
            INSERT INTO users (username, password, role)
            VALUES 
                ('test_admin', '$2a$10$X7z3bJ5Y2QZ1L4M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J', 'admin'),
                ('test_doctor', '$2a$10$X7z3bJ5Y2QZ1L4M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J', 'doctor'),
                ('test_nurse', '$2a$10$X7z3bJ5Y2QZ1L4M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J', 'nurse')
            ON CONFLICT (username) DO NOTHING;
        `);

        console.log('Test users created successfully');
    } catch (error) {
        console.error('Error creating test users:', error);
    } finally {
        pool.end();
    }
}

setupTestUsers(); 