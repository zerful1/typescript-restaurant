// auth.ts
// User Profile & Account Management

import { Router } from "express";
import { User } from "../database";
import { getUserId } from "../database/models/User";

const router = Router();

router.post("/check", async (req, res) => {
	const userId = req.session?.userId;
	const status = !!userId;
	let isAdmin = await User.isUserAdmin(userId);

	res.status(200).json({
		status,
		userId,
		isAdmin,
	});
});

router.post("/login", async (_req, _res) => {});

router.post("/register", async (req, res) => {
	const { email, password } = req.body;

	if (await getUserId(email)) {
		res.status(409).json({ message: "This email is already in use." });
		return;
	}

	// register the user
	const uid = await User.registerUser(email, password);
	res.status(200).json({ message: "User registered!", id: uid });
});

export { router };
