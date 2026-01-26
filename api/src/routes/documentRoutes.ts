import { Router } from "express";
import multer from "multer";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  retryIngestion,
  listAvailableBooks,
} from "../controllers/documentController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/list", listAvailableBooks);

router.use(authenticateToken, authorizeRole(["ADMIN"]));

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.post("/:id/retry", retryIngestion);
router.delete("/:id", deleteDocument);

export default router;
