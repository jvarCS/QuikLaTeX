import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";

export default function Dashboard({ session }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const navigate = useNavigate();

  // useEffect(() => {
  //   fetchDocuments();
  // }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (!error) setDocuments(data);
    setLoading(false);
  };
    fetchDocuments();
  }, []);

  const createDocument = async () => {
    const defaultContent = `\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}`;
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: session.user.id,
        title: "Untitled Document",
        content: defaultContent,
      })
      .select()
      .single();

    if (!error) navigate(`/editor/${data.id}`);
  };

  const deleteDocument = async (e, id) => {
    e.stopPropagation();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) setDocuments(docs => docs.filter(d => d.id !== id));
  };

  const startRename = (e, doc) => {
    e.stopPropagation();
    setRenaming(doc.id);
    setRenameValue(doc.title);
  };

  const submitRename = async (id) => {
    const { error } = await supabase
      .from("documents")
      .update({ title: renameValue })
      .eq("id", id);

    if (!error) {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, title: renameValue } : d));
    }
    setRenaming(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">∂</span>
          <span className="brand-name">QuikLaTeX</span>
        </div>
        <div className="dash-user">
          <span>{session.user.email}</span>
          <button className="signout-btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-top">
          <h2>Your Documents</h2>
          <button className="new-doc-btn" onClick={createDocument}>+ New Document</button>
        </div>

        {loading ? (
          <p className="dash-empty">Loading...</p>
        ) : documents.length === 0 ? (
          <div className="dash-empty">
            <p>No documents yet.</p>
            <button className="new-doc-btn" onClick={createDocument}>Create your first document</button>
          </div>
        ) : (
          <div className="doc-grid">
            {documents.map(doc => (
              <div className="doc-card" key={doc.id} onClick={() => navigate(`/editor/${doc.id}`)}>
                <div className="doc-card-icon">∂</div>
                <div className="doc-card-body">
                  {renaming === doc.id ? (
                    <input
                      className="rename-input"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => submitRename(doc.id)}
                      onKeyDown={e => e.key === "Enter" && submitRename(doc.id)}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <h3 className="doc-title">{doc.title}</h3>
                  )}
                  <span className="doc-date">Edited {formatDate(doc.updated_at)}</span>
                </div>
                <div className="doc-actions">
                  <button onClick={e => startRename(e, doc)} title="Rename">✎</button>
                  <button onClick={e => deleteDocument(e, doc.id)} title="Delete">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}