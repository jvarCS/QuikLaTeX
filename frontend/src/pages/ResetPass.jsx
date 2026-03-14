import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPass() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0e0e0e" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "320px" }}>
        <h2 style={{ fontFamily: "DM Serif Display", color: "#f0ede6", fontWeight: 400 }}>Set new password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleReset()}
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "12px 16px", color: "#f0ede6", fontFamily: "DM Mono, monospace", fontSize: "14px", outline: "none" }}
        />
        {error && <p style={{ color: "#ff6b6b", fontSize: "13px" }}>{error}</p>}
        <button
          onClick={handleReset}
          disabled={loading}
          style={{ background: "#c8f060", color: "#0e0e0e", border: "none", borderRadius: "6px", padding: "12px", fontFamily: "DM Mono, monospace", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          {loading ? "..." : "Update password"}
        </button>
      </div>
    </div>
  );
}
