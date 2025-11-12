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

export { router };
