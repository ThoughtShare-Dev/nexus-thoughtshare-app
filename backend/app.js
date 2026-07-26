import express from "express";
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
	res.json({
		success: true,
		data: { status: "ok" },
		message: "Server is running",
	});
});
export default app;
