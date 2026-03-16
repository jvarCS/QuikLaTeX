import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./ResetLanding.css";

export default function ResetLanding() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://quiklatex.vercel.app/reset-password'
    });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="reset-landing">
      <div className="reset-box">
        <h2>Enter email</h2>
        <input
          type="email"
          placeholder="youremail@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleReset()}
        />
        {error && <p className="reset-error">{error}</p>}
        <button onClick={handleReset} disabled={loading} className="reset-btn">
          {loading ? "..." : "Enter"}
        </button>
      </div>
    </div>
  );
}