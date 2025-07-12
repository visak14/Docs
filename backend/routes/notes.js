import { Router } from "express";
import Note from "../models/Note.js";
const router = Router();

router.post("/", async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.sendStatus(404);
    res.json(note);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, title: req.body.title },
      { new: true }
    );
    res.json(note);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 }); 
    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


export default router;