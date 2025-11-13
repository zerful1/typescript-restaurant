import { Router, type Request, type Response, type NextFunction } from "express";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session?.userId) {
    res.status(403).json({ message: "Must be logged in for this." });
    return;
  }

  next();
}

const router = Router();

export { router };
