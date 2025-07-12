import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: "updatedAt" } }
);

export default mongoose.model("Note", noteSchema);