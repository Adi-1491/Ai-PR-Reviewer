import React from "react";
import { motion } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const Login = () => {
  const handleLogin = () => {
    window.location.href = `${API}/auth/github`;
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <motion.div
        className="text-center space-y-4 max-w-max w-full px-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        >
        <h1 className="text-4xl font-bold">Welcome to AI PR Reviewer</h1>
        <p className="text-indigo-300">Please log in with GitHub to continue</p>
        <button
          onClick={handleLogin}
          className="mx-auto px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.05.14 3 .4 2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.76.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Login with GitHub
        </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
