const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    const defaultClient = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default DB first to create the new one
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await defaultClient.connect();
        console.log('Connected to default postgres database...');

        // Check if database exists
        const res = await defaultClient.query("SELECT 1 FROM pg_database WHERE datname='ticoviches_pos'");
        if (res.rowCount === 0) {
            console.log('Creating database ticoviches_pos...');
            await defaultClient.query('CREATE DATABASE ticoviches_pos');
            console.log('Database ticoviches_pos created.');
        } else {
            console.log('Database ticoviches_pos already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await defaultClient.end();
    }

    // Now connect to the new DB and run schema
    const dbClient = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'ticoviches_pos',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await dbClient.connect();
        console.log('Connected to ticoviches_pos database...');

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        console.log('Running schema.sql...');
        await dbClient.query(schemaSql);
        console.log('Schema executed successfully.');
    } catch (err) {
        console.error('Error running schema:', err);
    } finally {
        await dbClient.end();
    }
}

initDB();
