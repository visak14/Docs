import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { io } from "socket.io-client";
import { getNote, updateNote } from "../api/notes";

import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Image as ImageIcon,
  Users, Check, Clock, Wifi, WifiOff, Save, AlertCircle
} from "lucide-react";

export default function RichNoteEditor({ id }) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [activeUsers, setActiveUsers] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const saveTimeout = useRef();
  const socketRef = useRef();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Link,
      Image,
    ],
    content: "",
    onUpdate: ({ editor }) => {
    
      if (socketRef.current) {
        socketRef.current.emit("note_update", {
          noteId: id,
          content: editor.getHTML()
        });
      }
      
    
      setAutoSaveStatus("saving");
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await updateNote(id, editor.getHTML() , title);
          setLastSaved(new Date());
          setAutoSaveStatus("saved");
        } catch (e) {
          console.error("Save failed", e);
          setAutoSaveStatus("error");
        } finally {
          setIsSaving(false);
        }
      }, 1500);
    },
  });

  useEffect(() => {
   
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
    socketRef.current = socket;

   
    socket.on('connect', () => {
      setIsConnected(true);
    
      socket.emit('join_note', { noteId: id });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('active_users', (userCount) => {
      setActiveUsers(userCount);
    });


    socket.on('note_update', (content) => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    });

 
    (async () => {
      try {
        const { data } = await getNote(id);
        setTitle(data.title || "");
        if (editor) {
          editor.commands.setContent(data.content || "");
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      }
    })();

   
    return () => {
      socket.disconnect();
    };
  }, [id, editor]);

  const handleTitleBlur = async () => {
    setIsSaving(true);
    try {
      await updateNote(id, editor?.getHTML() || "", title);
      setLastSaved(new Date());
      setAutoSaveStatus("saved");
    } catch (e) {
      console.error("Failed to save title", e);
      setAutoSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading editor...</p>
      </div>
    </div>
  );

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case "saving":
        return <Save className="w-4 h-4 animate-spin text-blue-600" />;
      case "saved":
        return <Check className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return `Saved at ${lastSaved.toLocaleTimeString()}`;
      case "error":
        return "Save failed - retrying...";
      default:
        return "All changes saved";
    }
  };

  const generateUserColors = (count) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
      "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-red-500"
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
     
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
          
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

           
            <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 shadow-sm">
              {getAutoSaveIcon()}
              <span className="text-sm font-medium text-gray-700">
                {getAutoSaveText()}
              </span>
            </div>

         
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {activeUsers} active user{activeUsers !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex -space-x-2">
                {generateUserColors(Math.min(activeUsers, 5)).map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                    title={`User ${String.fromCharCode(65 + i)}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {activeUsers > 5 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    +{activeUsers - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
       
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 px-8 py-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Untitled Document"
              className="text-3xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg px-4 py-2 w-full placeholder-white/70 transition-all"
            />
          </div>

          <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    editor.isActive("bold") 
                      ? "bg-blue-500 text-white shadow-md" 
                      : "hover:bg-blue-100 text-gray-700"
                  }`}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    editor.isActive("italic") 
                      ? "bg-blue-500 text-white shadow-md" 
                      : "hover:bg-blue-100 text-gray-700"
                  }`}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>

                
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    editor.isActive("underline") 
                      ? "bg-blue-500 text-white shadow-md" 
                      : "hover:bg-blue-100 text-gray-700"
                  }`}
                  title="Underline"
                >
                  <UnderlineIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => {
                    const url = prompt("Enter link URL");
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                  }}
                  className="p-2 rounded-md hover:bg-blue-100 text-gray-700 transition-all duration-200 hover:scale-105"
                  title="Insert Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const url = prompt("Enter image URL");
                    if (url) editor.chain().focus().setImage({ src: url }).run();
                  }}
                  className="p-2 rounded-md hover:bg-blue-100 text-gray-700 transition-all duration-200 hover:scale-105"
                  title="Insert Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              
              <div className="ml-auto flex items-center space-x-2 bg-white rounded-lg px-3 py-1 shadow-sm">
                {getAutoSaveIcon()}
                <span className="text-xs text-gray-600">
                  {autoSaveStatus === "saving" ? "Saving..." : "Auto-save"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <EditorContent
              editor={editor}
              className="prose prose-lg max-w-none focus:outline-none min-h-[300px] leading-relaxed"
            />
          </div>

       
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>{editor?.getHTML().replace(/<[^>]*>/g, '').length || 0} characters</span>
                <span>•</span>
                <span>{editor?.getHTML().replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length || 0} words</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">Last activity:</span>
                <span className="font-medium">{lastSaved.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}