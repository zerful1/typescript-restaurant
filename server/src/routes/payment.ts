import { Router, type Request, type Response, type NextFunction } from "express";
import { type Product } from "../types";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

import StripeLoader from "stripe";
const stripe = new StripeLoader(process.env.STRIPE_SECRET!);

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session?.userId) {
    res.status(403).json({ message: "Must be logged in for this." });
    return;
  }

  next();
}

const router = Router();

router.post("/create-payment-session", requireAuth, async (req, res) => {
  const products: [Product] = req.body.products;

  console.log(products);

  const line_items = await Promise.all(
    products.map(async (product: Product) => {
      const productPath = path.join(process.cwd(), "src", "products", `${product.name}.json`);
      const readinfo = await fs.readFileSync(productPath).toString();
      const info = JSON.parse(readinfo);

      console.log(info);

      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
            image: [product.image],
          },
          unit_amount: info.price,
        },
        quantity: info.quantity,
      };
    })
  );

  const session = await stripe.checkout.sessions.create({
    line_items,
    payment_method_types: ["card"],
    mode: "payment",
    success_url: "",
    cancel_url: "",
  });

  res.json({ id: session.id });
});

export { router };
