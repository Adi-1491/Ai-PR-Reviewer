import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Reviewer from "./pages/Reviewer";
import Login from "./pages/Login";

const API = process.env.REACT_APP_API_URL;

const App = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [pullRequests, setPullRequests] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/user`, {
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

  useEffect(() => {
    const fetchUserAndPRs = async () => {
      try {
        const res = await axios.get(`${API}/user`, {
          withCredentials: true,
        });
        setUser(res.data);

        const prRes = await axios.get(`${API}/github/prs-for-review`, {
          withCredentials: true,
        });
        setPullRequests(Array.isArray(prRes.data) ? prRes.data : []);
      } catch {
        setUser(null);
        setPullRequests([]);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchUserAndPRs();
  }, []);

  const handleLogout = () => {
    window.location.href = `${API}/auth/logout`;
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
              <Reviewer
                user={user}
                pullRequests={pullRequests}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
      </Routes>
    </Router>
  );
};

export default App;
