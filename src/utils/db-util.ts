import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const dbPool = new Pool({
  user: String(process.env.USER),
  host: String(process.env.HOST),
  database: String(process.env.DATABASE),
  port: 5432,
  password: String(process.env.PASSWORD), 
  ssl: false,
});

export default dbPool;
