import Note from "./models/Note.js";

export default function registerSockets(io) {
  io.on("connection", (socket) => {
    socket.on("join_note", async ({ noteId }) => {
      socket.join(noteId);
      io.to(noteId).emit("active_users", io.sockets.adapter.rooms.get(noteId)?.size || 1);
      const note = await Note.findById(noteId);
      socket.emit("note_update", note.content);
    });

    socket.on("note_update", async ({ noteId, content }) => {
      socket.to(noteId).emit("note_update", content);
      if (socket.saveTimeout) clearTimeout(socket.saveTimeout);
      socket.saveTimeout = setTimeout(async () => {
        await Note.findByIdAndUpdate(noteId, { content });
      }, 2000);
    });

    socket.on("disconnecting", () => {
      for (const noteId of socket.rooms) {
        if (noteId !== socket.id)
          setTimeout(() => {
            io.to(noteId).emit("active_users", io.sockets.adapter.rooms.get(noteId)?.size - 1 || 0);
          }, 0);
      }
    });
  });
}