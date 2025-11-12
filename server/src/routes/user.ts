// user.ts
// User Profile & Account Management

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

const router = Router();

router.delete("/", requireAuth, async (req, res) => {
	const userId = req.session!.userId!;

	const deleted = await User.deleteAccount(userId);

	if (!deleted) {
		res.status(404).json({
			message: "User could not be deleted or couldn't be found.",
		});
		return;
	}

	req.session.destroy(() => {});
	res.status(204).json({ message: "Succesfully deleted" });
});

export { router };
