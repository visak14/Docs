
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import noteRoutes from "./routes/notes.js";
import registerSockets from "./socket.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Ideally restrict in production
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("Backend is up and running 🚀");
});


const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log(" MongoDB connected");

    
    registerSockets(io);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(` API + WS running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
