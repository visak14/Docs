import Note from "./models/Note.js";

export default function registerSockets(io) {
  io.on("connection", (socket) => {
    socket.on("join_note", async ({ noteId }) => {
      socket.join(noteId);
      io.to(noteId).emit("active_users", io.sockets.adapter.rooms.get(noteId)?.size || 1);
      const note = await Note.findById(noteId);
      socket.emit("note_update", note.content);
    });

     socket.on("join_note", async ({ noteId }) => {
  socket.join(noteId);
  io.to(noteId).emit("active_users", io.sockets.adapter.rooms.get(noteId)?.size || 1);

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      socket.emit("error", `Note with ID ${noteId} not found.`);
      return;
    }

    socket.emit("note_update", note.content);
  } catch (err) {
    console.error("Error finding note:", err);
    socket.emit("error", "Failed to load the note.");
  }
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
