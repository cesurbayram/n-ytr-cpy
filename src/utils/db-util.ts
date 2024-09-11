import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const dbPool = new Pool({
  user: String(process.env.USER),    // String olarak zorlayın
  host: String(process.env.HOST),
  database: String(process.env.DATABASE),
  port: 5432,
  password: String(process.env.PASSWORD), // Şifreyi string olarak zorlayın
  ssl: false,
});

export default dbPool;
