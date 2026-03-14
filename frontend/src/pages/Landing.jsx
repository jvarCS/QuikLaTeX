import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./Landing.css";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async () => {
    setError("");
    setLoading(true);
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    if (result.error) setError(result.error.message);
    setLoading(false);
  };

  return (
    <div className="landing">
      <div className="landing-left">
        <div className="landing-brand">
          <span className="brand-icon">∂</span>
          <h1>QuikLaTeX</h1>
        </div>
        <p className="landing-tagline">
          Write LaTeX. Compile instantly.<br />Save everything to the cloud.
        </p>
        <a href="/editor/guest" className="guest-link">
          Try without signing in →
        </a>
      </div>

      <div className="landing-right">
        <div className="auth-box">
          <div className="auth-welcome">
            <h2>{isSignUp ? "Create account" : "Sign in"}</h2>
            <span onClick={() => navigate("/reset") }>
              {isSignUp? "" : "Forgot password?"}
            </span>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" onClick={handleAuth} disabled={loading}>
            {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <p className="auth-toggle">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
              {isSignUp ? " Sign in" : " Sign up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}