import { Router } from "express";
import { User } from "../database";
import { getUserId } from "../database/models/User";

const router = Router();

router.get("/check", async (req, res) => {
	const userId = req.session?.userId;
	const status = !!userId;
	let isAdmin = await User.isUserAdmin(userId);

	res.status(200).json({
		status,
		userId,
		isAdmin,
	});
});

router.post("/login", async (req, res) => {
	if (req.session.userId) {
		res.status(400).json({ message: "You are already logged in!" });
		return;
	}

	const { email, password } = req.body;
	const userId = await User.canLoginUser(email, password);

	if (!userId) {
		res.status(401).json({
			message:
				"Email or password is incorrect, please check your information and try again.",
		});
		return;
	}

	req.session.userId = userId;
	res.status(200).json({ message: "Successfully logged in!" });
});

router.post("/register", async (req, res) => {
	if (req.session.userId) {
		res.status(400).json({ message: "You are already logged in!" });
		return;
	}

	const { email, password } = req.body;

	if (await getUserId(email)) {
		res.status(409).json({ message: "This email is already in use." });
		return;
	}

	// register the user
	const uid = await User.registerUser(email, password);
	res.status(201).json({ message: "User registered.", id: uid });
});

router.post("/logout", async (req, res) => {
	if (!req.session?.userId || !req.session) {
		res.status(400).json({ message: "You are already logged out." });
		return;
	}

	req.session.destroy((err) => {
		if (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		} else {
			console.log("Session destroyed.");
			res.status(200).json({ message: "You have been logged out." });
		}
	});
});

export { router };
