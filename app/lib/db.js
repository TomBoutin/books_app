import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.PGSQL_HOST,
    port: process.env.PGSQL_PORT,
    database: process.env.PGSQL_DATABASE,
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
});

export default pool;