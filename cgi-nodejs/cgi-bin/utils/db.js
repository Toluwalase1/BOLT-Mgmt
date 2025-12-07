const mysql = require('mysql2/promise');

// --- THE BOUNCER (Environment Check) ---
const isProduction = process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud');

// --- THE MASTER RECIPE (Configuration) ---
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    // Force correct database name
    database: 'main_db', 
    // Force correct Port (Priority: ENV -> 26897 -> 3306)
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 26897, 
    // SSL: Only use if in production (Aiven)
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    connectTimeout: 20000
};

// Export the config so others can use it
// OR export a helper to get a connection directly
const getConnection = async () => {
    try {
        console.error(`[DEBUG] Connecting to: ${dbConfig.host}:${dbConfig.port}`);
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error("[DB ERROR] Connection Failed:", error.message);
        throw error;
    }
};

module.exports = { dbConfig, getConnection };