const fs = require('fs');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

async function runSchema() {
    try {
        console.log('Connecting to database...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaQuery = fs.readFileSync(schemaPath, { encoding: 'utf8' });

        console.log('Executing schema.sql...');
        await pool.query(schemaQuery);

        console.log('Schema executed successfully!');
    } catch (error) {
        console.error('Error executing schema:', error);
    } finally {
        await pool.end();
    }
}

runSchema();
