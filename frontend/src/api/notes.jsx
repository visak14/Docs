import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
export const createNote = (title) => api.post("/notes", { title });
export const getNote = (id) => api.get(`/notes/${id}`);
export const updateNote = (id, content , title) => api.put(`/notes/${id}`, { content , title });
export const getAllNotes = () => api.get("/notes");
