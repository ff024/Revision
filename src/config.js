// src/config.js
require('dotenv').config();

function requireEnv(name, def = undefined) {
    const v = process.env[name] ?? def;
    if (v === undefined || v === '') {
        throw new Error(`Missing env var: ${name}`);
    }
    return v;
}

module.exports = {
    PORT: Number(process.env.PORT || 3000),
    DB: {
        host: requireEnv('DB_HOST', 'localhost'),
        port: Number(process.env.DB_PORT || 3306),
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASSWORD'),
        database: requireEnv('DB_NAME'),
    },
    PUBLIC_DIR: require('path').join(__dirname, '..', 'public'),
};
