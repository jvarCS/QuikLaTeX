import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import ResetPass from "./pages/ResetPass";
import ResetLanding from "./pages/ResetLanding";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // loading

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
        <Route path="/editor/:id" element={session ? <Editor /> : <Navigate to="/" />} />
        <Route path="/editor/guest" element={<Editor guest />} />
        <Route path="/reset-password" element={<ResetPass />} />
        <Route path="/reset" element={<ResetLanding />} />
      </Routes>
    </BrowserRouter>
  );
}