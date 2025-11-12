import bcrypt from "bcrypt";
import crypto from "crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { getPool } from "../connection.js";

export interface UserData {
	id: number;
	email: string;
}

export async function getUserId(email: string): Promise<number | false> {
	const pool = getPool();
	const [users] = await pool.query<RowDataPacket[]>(
		"SELECT id FROM users WHERE email = ?",
		[email]
	);

	return users.length > 0 ? users[0].id : false;
}

export async function canLoginUser(
	email: string,
	password: string
): Promise<number | false> {
	const pool = getPool();
	const [users] = await pool.query<RowDataPacket[]>(
		"SELECT id, password_hash FROM users WHERE email = ?",
		[email]
	);

	if (users.length === 0) return false;

	const user = users[0];

	const isValid = await bcrypt.compare(password, user.password_hash);

	return isValid ? user.id : false;
}

export async function registerUser(
	email: string,
	password: string
): Promise<number> {
	const pool = getPool();
	const hashedPassword = await bcrypt.hash(password, 10);

	const [result] = await pool.query<ResultSetHeader>(
		"INSERT INTO users (email, password_hash) VALUES (?, ?)",
		[email, hashedPassword]
	);
	return result.insertId;
}

export async function getUserData(id: number): Promise<UserData | null> {
	const pool = getPool();

	const [users] = await pool.query<RowDataPacket[]>(
		"SELECT id, email FROM users WHERE id = ?",
		[id]
	);

	if (users.length === 0) return null;

	return users[0] as UserData;
}

export async function createPasswordReset(email: string): Promise<string> {
	const pool = getPool();

	const token = crypto.randomBytes(32).toString("hex");
	const expires = new Date(Date.now() + 60 * 60 * 1000);

	await pool.query<RowDataPacket[]>(
		"UPDATE users SET reset_token = ?, reset_expires = ?, WHERE email = ?",
		[token, expires, email]
	);

	return token;
}

export async function completePasswordReset(
	token: string,
	newPassword: string
): Promise<boolean> {
	const pool = getPool();

	const [users] = await pool.query<RowDataPacket[]>(
		"SELECT id, email FROM users WHERE reset_token = ? AND reset_expires > NOW()",
		[token]
	);

	if (users.length > 0) return false;

	const userId = users[0].id;

	const hashedPassword = bcrypt.hash(newPassword, 10);

	await pool.query<RowDataPacket[]>(
		"UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
		[hashedPassword, userId]
	);

	return true;
}

export async function deleteAccount(userId: number): Promise<boolean> {
	const pool = getPool();

	const [result] = await pool.query<ResultSetHeader>(
		"DELETE FROM users WHERE id = ?",
		[userId]
	);

	return result.affectedRows > 0;
}

export async function isUserAdmin(
	userId: number | undefined
): Promise<boolean> {
	const pool = getPool();

	const [result] = await pool.query<RowDataPacket[]>(
		"SELECT is_admin FROM users WHERE id = ?",
		[userId]
	);

	if (!result[0]) {
		return false;
	}

	return result[0].is_admin;
}
