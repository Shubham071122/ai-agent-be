import { Request, Response } from "express";
import DocumentModel from "../models/Document";
import ChunkModel from "../models/Chunk";
import { AuthRequest } from "../middleware/authMiddleware";
import AWS from "aws-sdk";
import axios from "axios";

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const file = req.file;
    const s3Key = `documents/${Date.now()}_${file.originalname}`;

    await s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const newDoc = new DocumentModel({
      filename: file.originalname,
      s3Key: s3Key,
      uploadedBy: req.user!.userId,
      status: "PENDING",
    });
    await newDoc.save();

    try {
      axios
        .post(`${process.env.INGESTION_SERVICE_URL}/ingest`, {
          documentId: newDoc._id,
          s3Key: s3Key,
        })
        .catch((err) =>
          console.error("Ingestion Trigger Failed:", err.message),
        );
    } catch (e) {
      console.error("Failed to call ingestion service", e);
    }

    res.status(201).json({
      message: "Document uploaded and ingestion started",
      document: newDoc,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};

export const listDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await DocumentModel.find().populate("uploadedBy", "email");
    res.json(docs);
  } catch (error) {
    console.error("List Documents Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: doc.s3Key,
      })
      .promise();

    await DocumentModel.findByIdAndDelete(id);

    await ChunkModel.deleteMany({ documentId: id });

    res.json({ message: "Document and vectors deleted successfully" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const retryIngestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    try {
      axios
        .post(`${process.env.INGESTION_SERVICE_URL}/ingest`, {
          documentId: doc._id,
          s3Key: doc.s3Key,
        })
        .catch((err) =>
          console.error("Ingestion Retry Trigger Failed:", err.message),
        );
    } catch (e) {
      console.error("Failed to call ingestion service", e);
    }

    res.json({ message: "Ingestion retry started", document: doc });
  } catch (error) {
    console.error("Retry Ingestion Error:", error);
    res.status(500).json({ message: "Server error during retry ingestion" });
  }
};

export const listAvailableBooks = async (req: Request, res: Response) => {
  try {
    const docs = await DocumentModel.find(
      { status: "COMPLETED" },
      { filename: 1, _id: 1, createdAt: 1 },
    ).sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("List Available Books Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
