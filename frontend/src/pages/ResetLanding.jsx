import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetLanding() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

  const handleReset = async () => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/reset-password'
    });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0e0e0e" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "320px" }}>
        <h2 style={{ fontFamily: "DM Serif Display", color: "#f0ede6", fontWeight: 400 }}>Enter email</h2>
        <input
          type="email"
          placeholder="youremail@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleReset()}
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "12px 16px", color: "#f0ede6", fontFamily: "DM Mono, monospace", fontSize: "14px", outline: "none" }}
        />
        {error && <p style={{ color: "#ff6b6b", fontSize: "13px" }}>{error}</p>}
        <button
          onClick={handleReset}
          disabled={loading}
          style={{ background: "#c8f060", color: "#0e0e0e", border: "none", borderRadius: "6px", padding: "12px", fontFamily: "DM Mono, monospace", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          {loading ? "..." : "Enter"}
        </button>
      </div>
    </div>
  );
}
