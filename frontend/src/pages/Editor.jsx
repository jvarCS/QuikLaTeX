import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Editor.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const DEFAULT_LATEX = `\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}`;
const AUTOSAVE_DELAY = 2000;

export default function Editor({ guest }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(DEFAULT_LATEX);
  const [title, setTitle] = useState("Untitled Document");
  const [editingTitle, setEditingTitle] = useState(false);
  const [compileStatus, setCompileStatus] = useState("idle"); // idle | compiling | success | error
  const [compileError, setCompileError] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved
  const [currentBlob, setCurrentBlob] = useState(null);

  const containerRef = useRef(null);
  const autosaveTimer = useRef(null);
  const titleInputRef = useRef(null);

  // Load document
  useEffect(() => {
    if (guest || !id || id === "guest") return;
    const loadDoc = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) { navigate("/dashboard"); return; }
      setContent(data.content);
      setTitle(data.title);
    };
    loadDoc();
  }, [id]);

  // Autosave
  useEffect(() => {
    if (guest || !id || id === "guest") return;
    const changeStatus = async () => {
      setSaveStatus("unsaved");
    };
    changeStatus();
    // setSaveStatus("unsaved");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      const { error } = await supabase
        .from("documents")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", id);
      setSaveStatus(error ? "unsaved" : "saved");
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(autosaveTimer.current);
  }, [content]);

  const saveTitle = async (newTitle) => {
    setTitle(newTitle);
    setEditingTitle(false);
    if (guest || !id) return;
    await supabase.from("documents").update({ title: newTitle }).eq("id", id);
  };

  // Compile
  const compile = useCallback(async () => {
    setCompileStatus("compiling");
    setCompileError("");
    try {
      const response = await fetch(`${BACKEND_URL}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex: content }),
      });

      if (!response.ok) {
        const error = await response.json();
        setCompileStatus("error");
        setCompileError(error.error || "Compilation failed");
        return;
      }

      const blob = await response.blob();
      setCurrentBlob(blob);
      setCompileStatus("success");

      const url = URL.createObjectURL(blob);
      containerRef.current.innerHTML = "";

      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js";

      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(pdf => {
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          pdf.getPage(pageNum).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            containerRef.current?.appendChild(canvas);
            page.render({ canvasContext: canvas.getContext("2d"), viewport });
          });
        }
      });
    } catch (err) {
      setCompileStatus("error");
      setCompileError("Could not connect to server: " + err);
    }
  }, [content]);

  const exportLatex = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!currentBlob) { alert("Compile the document first"); return; }
    const url = URL.createObjectURL(currentBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.pdf`;
    a.click();
  };

  const importLatex = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target.result);
    reader.readAsText(file);
    e.target.value = "";
  };

  const statusLabel = {
    idle: "",
    compiling: "Compiling...",
    success: "Compiled ✓",
    error: "Error",
  };

  return (
    <div className="editor">
      {/* Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          <span className="brand-icon" onClick={() => guest? navigate("/") : navigate("/dashboard")}>∂</span>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={e => saveTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveTitle(e.target.value)}
              autoFocus
            />
          ) : (
            <span
              className="doc-title-display"
              onClick={() => !guest && setEditingTitle(true)}
              title={guest ? "" : "Click to rename"}
            >
              {title}
            </span>
          )}
          {!guest && (
            <span className={`save-status ${saveStatus}`}>
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Unsaved"}
            </span>
          )}
          {guest && <span className="guest-badge">Guest Mode</span>}
        </div>

        <div className="editor-header-right">
          <button className="toolbar-btn compile-btn" onClick={compile}>
            {compileStatus === "compiling" ? "Compiling..." : "Compile"}
          </button>
          <button className="toolbar-btn" onClick={exportLatex}>Export .tex</button>
          <button className="toolbar-btn" onClick={exportPDF}>Export PDF</button>
          <label className="toolbar-btn">
            Import .tex
            <input type="file" accept=".tex" onChange={importLatex} style={{ display: "none" }} />
          </label>
          {guest && (
            <button className="toolbar-btn signup-btn" onClick={() => navigate("/")}>
              Sign up to save →
            </button>
          )}
        </div>
      </header>

      {/* Compile status bar */}
      {compileStatus === "error" && compileError && (
        <div className="error-bar">
          <strong>LaTeX Error:</strong> {compileError}
          <button onClick={() => setCompileStatus("idle")}>✕</button>
        </div>
      )}

      {/* Main split pane */}
      <div className="editor-body">
        <div className="editor-pane">
          <div className="pane-label">LaTeX</div>
          <textarea
            className="latex-editor"
            value={content}
            onChange={e => setContent(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="divider" />

        <div className="pdf-pane">
          <div className="pane-label">
            PDF Preview
            <span className={`compile-status ${compileStatus}`}>
              {statusLabel[compileStatus]}
            </span>
          </div>
          <div className="pdf-container" ref={containerRef}>
            {compileStatus === "idle" && (
              <div className="pdf-placeholder">
                <span>∂</span>
                <p>Click Compile to render your PDF</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}