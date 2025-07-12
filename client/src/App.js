import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Reviewer from "./pages/Reviewer";
import Login from "./pages/Login";

const App = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5001/user", {
          withCredentials: true,
        });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    window.location.href = "http://localhost:5001/auth/logout";
  };

  if (!authChecked) {
    return <div className="text-white text-center mt-20">Checking authentication...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Reviewer user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
