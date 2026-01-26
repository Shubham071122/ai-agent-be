import mongoose, { Schema, Document } from "mongoose";

export interface IChunk extends Document {
  documentId: mongoose.Types.ObjectId;
  content: string;
  metadata: {
    pageNumber: number;
    chunkIndex: number;
  };
  embedding: number[];
  createdAt: Date;
}

const ChunkSchema: Schema = new Schema({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    pageNumber: { type: Number, required: true },
    chunkIndex: { type: Number, required: true },
  },
  embedding: {
    type: [Number],
    required: true,
    // Indexing for Vector Search will be defined in Atlas,
    // but defining the field here is necessary.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IChunk>("Chunk", ChunkSchema);
