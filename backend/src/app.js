import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
    message: "Server is running",
  });
});

export default app;