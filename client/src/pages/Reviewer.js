import React, { useState, useEffect } from "react";
import axios from "axios";
import Highlight from "react-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { motion, AnimatePresence } from "framer-motion";

const Reviewer = ({user, onLogout}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const [aiMessage, setAiMessage] = useState(""); 
  const [repo, setRepo] = useState("");
  const [prNumber, setPrNumber] = useState("");

  const MAX_LENGTH = 1000;
  const charCount = code.length;

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedSuggestions = localStorage.getItem("aiSuggestions");
    const savedInput = localStorage.getItem("aiInputcode");
    if (savedSuggestions) setSuggestions(JSON.parse(savedSuggestions));
    if (savedInput) setCode(savedInput);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!loading) {
      setAiMessage("");
      return;
    }

    const facts = [
      "Did you know? AI can already write poetry!",
      "GPT stands for Generative Pretrained Transformer.",
      "Thinking through your logic like Sherlock Holmes...",
      "Brains warming up, optimizing structure...",
      "Boosting your code’s IQ by 9000...",
      "Finding the missing semicolon..."
    ];
    let index = 0;
    setAiMessage(facts[index]);

    const interval = setInterval(() => {
      index = (index + 1) % facts.length;
      setAiMessage(facts[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuggestions([]);
    setLoading(true);

    if (!code.trim()) {
      setError("⚠️ Please enter code for review.");
      setLoading(false);
      return;
    }

    if (code.length > MAX_LENGTH) {
      setError("Code too long. Please keep it under 1000 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/review", { code });
      setSuggestions(res.data.suggestions);
      localStorage.setItem("aiSuggestions", JSON.stringify(res.data.suggestions));
      saveReviewHistory(code, res.data.suggestions);
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (codeSnippet, index) => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleClear = () => {
    setCode("");
    setSuggestions([]);
    setError("");
    localStorage.removeItem("aiSuggestions");
    localStorage.removeItem("aiInputcode");
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all history?")) return;
    try {
      await axios.delete("http://localhost:5001/api/history");
      setHistory([]);
      setSearchTerm("");
    } catch (err) {
      console.error("Failed to delete history:", err);
    }
  };

  const saveReviewHistory = async (code, suggestions) => {
    try {
      const res = await axios.post("http://localhost:5001/api/history", { code, suggestions });
      setHistory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const filteredHistory = history.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFetchPR = async () => {
    setError(""); // reset error before starting
  
    try {
      const res = await axios.post(
        "http://localhost:5001/github/fetch-pr",
        { repo, prNumber },
        { withCredentials: true }
      );
  
      const prCode = res.data.files.map(f => f.patch).join("\n\n");
      setCode(prCode);
      setSuggestions([]);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch PR.";
      setError(msg);
  
      setTimeout(() => {
        setError("");
      }, 4000);
    }
  };
  

  return (
    <AnimatePresence>
        {/* Top Header */}
        <div className="fixed top-0 left-0 w-full px-4 py-3 bg-slate-900/90 backdrop-blur-md flex justify-end items-center z-50 shadow-md">
          <div className="flex items-center gap-3 text-white">
              <img
              src={user?.avatar}
              alt="GitHub Avatar"
              className="w-8 h-8 rounded-full shadow-lg"
              />
              <span className="hidden sm:inline text-sm">{user?.username}</span>
              <button
              onClick={onLogout}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
              >
              Logout
              </button>
          </div>
        </div>
      {showLanding ? (
        <motion.div
          className="min-h-screen flex items-center justify-center bg-slate-900 text-indigo-300 text-3xl font-bold"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center space-y-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.05 }}
            transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
          >
            <p className="text-5xl font-extrabold">AI PR Reviewer</p>
            <p className="text-indigo-400 text-lg">Initializing intelligence...</p>
          </motion.div>
        </motion.div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 text-gray-100 font-mono px-4">
          <div className="w-full max-w-3xl mx-auto bg-slate-700/80 border border-slate-600 shadow-xl rounded-3xl p-8 space-y-8 transition-all duration-500">

            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-wider text-indigo-300 animate-pulse">AI PR Reviewer</h1>
              <p className="text-slate-300 mt-2">Your futuristic code companion</p>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setShowHistory(!showHistory)} className="text-sm hover:text-indigo-300 transition">
                {showHistory ? "Hide History" : "View History"}
              </button>
              <button
                disabled={!history.length}
                onClick={handleClearHistory}
                className={`text-sm hover:text-red-400 transition ${history.length === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Clear History
              </button>
            </div>

            {showHistory && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 bg-slate-600 border border-indigo-400 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ul className="max-h-96 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-600">
                  {filteredHistory.length === 0 ? (
                    <p className="text-gray-400">No matching history found.</p>
                  ) : (
                    filteredHistory.map((item, i) => (
                      <li key={item._id} className="border border-slate-600 p-4 rounded-xl bg-slate-700/80">
                        <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                        <pre className="bg-slate-900 text-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">{item.code}</pre>
                        <ul className="mt-2 text-sm text-indigo-300 space-y-1">
                          {item.suggestions.map((s, j) => (
                            <li key={j}>{s.comment}</li>
                          ))}
                        </ul>
                        <div className="flex gap-4 mt-2 text-sm">
                          <button
                            onClick={() => {
                              setCode(item.code);
                              setSuggestions(item.suggestions);
                              setShowHistory(false);
                              localStorage.setItem("aiInputcode", item.code);
                              localStorage.setItem("aiSuggestions", JSON.stringify(item.suggestions));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-cyan-300 hover:underline"
                          >
                            Reopen Review
                          </button>
                          <button
                            onClick={async () => {
                              await axios.delete(`http://localhost:5001/api/history/${item._id}`);
                              setHistory((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                            className="text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4 space-x-2 flex">
                <input
                  type="text"
                  placeholder="owner/repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="flex-1 p-2 rounded text-black"
                />
                <input
                  type="number"
                  placeholder="PR #"
                  value={prNumber}
                  onChange={(e) => setPrNumber(e.target.value)}
                  className="w-24 p-2 rounded text-black"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Optionally, you can call handleFetchPR() here if you want Enter to fetch PR
                    }
                  }}
                />
                <button
                type="button"
                  onClick={handleFetchPR}
                  className="bg-green-600 text-white px-4 rounded hover:bg-green-500"
                >
                  Fetch PR
                </button>
              </div>
              <textarea
                rows={10}
                className={`w-full p-4 text-sm rounded-xl font-mono bg-slate-600 text-gray-100 border ${
                  charCount > MAX_LENGTH ? "border-red-400" : "border-indigo-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                placeholder="Paste your code here..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  localStorage.setItem("aiInputcode", e.target.value);
                }}
              />
              <div className="text-right text-xs text-gray-400">
                <span className={charCount > MAX_LENGTH ? "text-red-400" : "text-indigo-300"}>
                  {charCount}/{MAX_LENGTH}
                </span>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2 px-4 text-white rounded-lg font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all shadow-md ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Reviewing..." : "Review Code"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 bg-slate-600 text-gray-200 py-2 px-4 rounded-lg hover:bg-slate-500"
                >
                  Clear
                </button>
              </div>

              {/* AI Avatar and fun fact during loading */}
              {loading && (
                <div className="text-center mt-4">
                  <div className="text-4xl animate-bounce mb-2">🤖</div>
                  <p className="text-sm text-indigo-300 animate-pulse">{aiMessage}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-200 text-red-800 p-2 rounded text-sm mt-2">{error}</div>
              )}
            </form>

            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-indigo-300">AI Suggestions</h2>
                <ul className="space-y-4">
                  {suggestions.map((s, i) => (
                    <li key={s.comment} className="bg-slate-700 p-4 rounded-xl border border-slate-600 shadow-md">
                      <p className="text-sm mb-2 text-indigo-300">{s.comment}</p>
                      {s.code && (
                        <>
                          <Highlight className="javascript text-sm text-gray-100">{s.code}</Highlight>
                          <button
                            onClick={() => handleCopy(s.code, i)}
                            className="text-xs mt-2 text-cyan-300 hover:underline"
                          >
                            {copiedIndex === i ? "Copied" : "Copy"}
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Reviewer;
