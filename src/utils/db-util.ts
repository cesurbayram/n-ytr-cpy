import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbPool = new Pool({
  user: String(process.env.USER),
  host: String(process.env.HOST),
  database: String(process.env.DATABASE),
  port: 5432,
  password: String(process.env.PASSWORD),
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default dbPool;
