
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaRegStickyNote } from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./HomePage.css"; 

import { createNote, getAllNotes } from "../src/api/notes";

dayjs.extend(relativeTime);

export default function HomePage() {
  const nav = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAllNotes();
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  
  const createNew = async () => {
    try {
      const { data } = await createNote("Untitled Note");
      if (data?._id) nav(`/notes/${data._id}`);
    } catch (e) {
      console.error(e);
      alert("Something went wrong while creating the note.");
    }
  };

  
  return (
    <main className="main-container">
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <h1 className="title">Your Notes</h1>
          <button onClick={createNew} className="new-note-btn desktop-only">
            <FaPlus /> New Note
          </button>
        </header>

        {error && <p className="error-message">{error}</p>}

        <section className="notes-grid">
         
          <button onClick={createNew} className="add-note-card">
            <FaPlus className="add-icon" />
            <span className="add-text">Add note</span>
          </button>

          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line-short" />
              </div>
            ))}

     
          {!loading &&
            notes.map((n) => (
              <article
                key={n._id}
                role="button"
                tabIndex={0}
                onClick={() => nav(`/notes/${n._id}`)}
                onKeyDown={(e) => e.key === "Enter" && nav(`/notes/${n._id}`)}
                className="note-card"
                aria-label={`Open note ${n.title || "Untitled"}`}
              >
                <header className="note-header">
                  <FaRegStickyNote className="note-icon" />
                  <h2 className="note-title">
                    {n.title || "Untitled"}
                  </h2>
                </header>

                <p className="note-content">
                  {n.content?.replace(/<[^>]*>/g, "") || "No content"}
                </p>

                <time dateTime={n.updatedAt} className="note-time">
                  {dayjs(n.updatedAt).fromNow()}
                </time>
              </article>
            ))}
        </section>

    
        {!loading && notes.length === 0 && (
          <p className="empty-state">
            No notes yet. Click the card above to start writing!
          </p>
        )}
      </div>
    </main>
  );
}