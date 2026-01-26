import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import queryRoutes from "./routes/queryRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/query", queryRoutes);

app.get("/", (req, res) => {
  res.send("RAG Backend API is running.");
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
