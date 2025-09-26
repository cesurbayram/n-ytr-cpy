import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbPool = new Pool({
  user: String(process.env.DB_USER),
  host: String(process.env.DB_HOST),
  database: String(process.env.DB_DATABASE),
  port: 5432,
  password: String(process.env.DB_PASSWORD),
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default dbPool;
