import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();
const corsOptions = { origin: process.env.CORS_ORIGIN, credentials: true };
app.use(express.json({ limit: "16kb", strict: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.static("public"));

import { userRouter } from "./routes/user.route.js";
import { projectRouter } from "./routes/project.route.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);

app.use(errorHandler);
export { app };
