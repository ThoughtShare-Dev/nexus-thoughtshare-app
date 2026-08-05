import express from "express";
import { sendSuccess } from "./src/utils/response.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandlers.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  return sendSuccess(res, 200, "Server is running");
});

app.use(notFound);
app.use(errorHandler);

export default app;