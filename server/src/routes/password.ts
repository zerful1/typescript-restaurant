import {
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { User } from "../database";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
	if (!req.session || !req.session?.userId) {
		res.status(403).json({ message: "Must be logged in for this." });
		return;
	}

	next();
}

async function antiAuth(req: Request, res: Response, next: NextFunction) {
	if (req.session?.userId) {
		res.status(403).json({ message: "Must not be logged in for this." });
		return;
	}

	next();
}

const router = Router();

router.put("/", requireAuth, async (req, res) => {
	// change password
	const { currentPassword, newPassword } = req.body;

	const [statusCode, message] = await User.changePassword(
		req.session!.userId!,
		currentPassword,
		newPassword
	);

	res.status(statusCode).json({ message });
});

router.post("/forgot", antiAuth, async (req, res) => {
	const { email } = req.body;

	const token = await User.createPasswordReset(email);

	// PRODUCTION: replace this with an email link or whatever
	res.status(200).json({ message: "For testing only!", token });
});

router.put("/reset", antiAuth, async (req, res) => {
	const { resetToken, newPassword } = req.body;

	const completed = await User.completePasswordReset(resetToken, newPassword);

	if (!completed) {
		res.status(400).json({ message: "something went wrong" });
		return;
	}

	res.status(200).json({ message: "password reset complete" });
});

export { router };
