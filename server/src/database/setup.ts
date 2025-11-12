import mysql from "mysql2/promise";
import chalk from "chalk";
import fs from "fs";
import { createPool, DATABASE_NAME } from "./connection.js";

import path from "path";

const dbSchema = path.join(process.cwd(), "src", "schemas", "main.sql");

async function dbExists(connection: mysql.Connection): Promise<boolean> {
	const [databases] = await connection.query<mysql.RowDataPacket[]>(
		`SHOW DATABASES LIKE '${DATABASE_NAME}'`
	);
	return databases.length > 0;
}

async function runSQL(
	filePath: string,
	connection: mysql.Connection
): Promise<void> {
	try {
		const file = fs.readFileSync(filePath, "utf8");

		const statements = file
			.split(";")
			.map((stmt) => stmt.trim().replace(/\[db\]/, DATABASE_NAME))
			.filter((stmt) => stmt.length > 0)
			.filter((stmt) => !stmt.startsWith("--"));

		console.log(chalk.yellow.bold("Running SQL file..."));

		for (const statement of statements) {
			await connection.query(statement);
		}

		const exists = await dbExists(connection);

		if (exists) {
			createPool();
		}
	} catch (error) {
		console.log(chalk.red.bold("Failed to run SQL file:", error));
		throw error;
	}
}

export async function initializeDatabase(): Promise<void> {
	let connection: mysql.Connection | undefined;

	try {
		connection = await mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "",
			multipleStatements: true,
		});

		const exists = await dbExists(connection);

		if (exists) {
			console.log(
				chalk.cyanBright(
					`Database ${DATABASE_NAME} exists! Continuing...\nWill run SQL to create any missing tables`
				)
			);
		} else {
			console.log(
				chalk.yellow.bold(`Database ${DATABASE_NAME} doesn't exist...`)
			);
		}

		await runSQL(dbSchema, connection);
		connection.destroy();
		createPool();
	} catch (error) {
		console.log(
			chalk.red.bold("Failed to connection to SQL database:"),
			error
		);
	}
}
