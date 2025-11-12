import express from "express";
import chalk from "chalk";
import session from "express-session";

const app = express();

// routers

import {
	authRouter,
	bookingRouter,
	passwordRouter,
	userRouter,
} from "./routes";
import { initializeDatabase } from "./database";

// app constants

const PORT_NUMBER = 5000;

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: "supersupersecret",
		saveUninitialized: false,
		resave: true,
		cookie: {
			secure: false,
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		},
	})
);

// routes

app.use("/auth", authRouter);
app.use("/booking", bookingRouter);
app.use("/password", passwordRouter);
app.use("/user", userRouter);

// start app

app.listen(PORT_NUMBER, async (err) => {
	if (err) {
		console.error(err);
	} else {
		await initializeDatabase();
		console.log(
			chalk.bgBlueBright(`Server listening on port ${PORT_NUMBER}!`)
		);
	}
});
