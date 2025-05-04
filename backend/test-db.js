const path = require('path');
const { pool } = require('./config/database');

async function testConnection() {
    let client;
    try {
        console.log('Testing database connection...');
        client = await pool.connect();
        console.log('✅ Successfully connected to the database');

        // Test users table
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        console.log(`✅ Users table exists with ${usersResult.rows[0].count} records`);

        // Test patients table
        const patientsResult = await client.query('SELECT COUNT(*) FROM patients');
        console.log(`✅ Patients table exists with ${patientsResult.rows[0].count} records`);

        // Test medical_analysis table
        const analysisResult = await client.query('SELECT COUNT(*) FROM medical_analysis');
        console.log(`✅ Medical analysis table exists with ${analysisResult.rows[0].count} records`);

        // Test treatment_plans table
        const plansResult = await client.query('SELECT COUNT(*) FROM treatment_plans');
        console.log(`✅ Treatment plans table exists with ${plansResult.rows[0].count} records`);

        // Test audit_logs table
        const logsResult = await client.query('SELECT COUNT(*) FROM audit_logs');
        console.log(`✅ Audit logs table exists with ${logsResult.rows[0].count} records`);

        // Test default users
        const defaultUsers = await client.query('SELECT username, role FROM users');
        console.log('\nDefault users in the system:');
        defaultUsers.rows.forEach(user => {
            console.log(`- ${user.username} (${user.role})`);
        });

    } catch (error) {
        console.log('❌ Error testing database connection:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('   - Database server is not running or not accessible');
        } else if (error.code === '42P01') {
            console.log('   - One or more required tables are missing. Have you run the schema.sql file?');
        } else if (error.code === '28P01') {
            console.log('   - Invalid database credentials. Check your .env file');
        } else {
            console.log('   - Unexpected error:', error);
        }
    } finally {
        if (client) {
            await client.release();
        }
    }
}

testConnection().then(() => {
    pool.end();
}); 