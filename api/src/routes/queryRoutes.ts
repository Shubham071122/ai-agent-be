import { Router } from "express";
import { askQuestion } from "../controllers/queryController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/ask",
  authenticateToken,
  authorizeRole(["USER", "ADMIN"]),
  askQuestion,
);

export default router;
