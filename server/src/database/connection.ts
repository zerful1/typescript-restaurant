import mysql from "mysql2/promise";
import chalk from "chalk";

export const DATABASE_NAME = "restaurant_db2";

let pool: mysql.Pool | null = null;

export function createPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: DATABASE_NAME,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });
    console.log(chalk.greenBright("Database pool created"));
  }
  return pool;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error("Database pool not initialized. Call createPool() first.");
  }
  return pool;
}
