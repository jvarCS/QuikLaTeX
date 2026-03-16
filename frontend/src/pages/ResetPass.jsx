import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ResetLanding.css";

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
    <div className="reset-landing">
      <div className="reset-box">
        <h2>Set new password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleReset()}
        />
        {error && <p className="reset-error">{error}</p>}
        <button onClick={handleReset} disabled={loading} className="reset-btn">
          {loading ? "..." : "Update password"}
        </button>
      </div>
    </div>
  );
}