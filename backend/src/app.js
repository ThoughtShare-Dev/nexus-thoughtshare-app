import memberRoutes from "./routes/member.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import express from "express";
import learningRequestRoutes from "./routes/learningRequest.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { sendSuccess } from "./utils/response.js";
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  return sendSuccess(res, 200, null, "Server is running");
});

app.use("/auth", authRoutes);
app.use("/members", memberRoutes);
app.use("/skills", skillRoutes);
app.use("/requests", learningRequestRoutes);
app.use("/reviews", reviewRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;