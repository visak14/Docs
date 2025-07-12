import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import noteRoutes from "./routes/notes.js";
import registerSockets from "./socket.js";
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/notes", noteRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
registerSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`API + WS on :${PORT}`));