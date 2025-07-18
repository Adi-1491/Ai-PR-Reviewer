import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Highlight from "react-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.REACT_APP_API_URL;

const Reviewer = ({ user, pullRequests = [], onLogout }) => {
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
  const [fetchedFiles, setFetchedFiles] = useState([]);

  const MAX_LENGTH = 10000;
  const charCount = code.length;

  // 🟢 Dynamic navbar height handling
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(120);

  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

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
        const res = await axios.get(`${API}/api/history`, {
          withCredentials: true,
        });
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
      setError("Please enter code for review.");
      setLoading(false);
      return;
    }

    if (code.length > MAX_LENGTH) {
      setError("Code too long. Please keep it under 10000 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API}/api/review`, { code });
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
      await axios.delete(`${API}/api/history`, {
        withCredentials: true,
      });
      setHistory([]);
      setSearchTerm("");
    } catch (err) {
      console.error("Failed to delete history:", err);
    }
  };

  const saveReviewHistory = async (code, suggestions) => {
    try {
      const res = await axios.post(`${API}/api/history`, { code, suggestions }, { withCredentials: true });
      setHistory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const filteredHistory = history.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFetchPR = async () => {
    setError("");
    try {
      const res = await axios.post(
        `${API}/github/fetch-pr`,
        { repo, prNumber },
        { withCredentials: true }
      );
      setFetchedFiles(res.data.files);
      setCode("");
      setSuggestions([]);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch PR.";
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <AnimatePresence>
      {/* ✅ Responsive Navbar with ref */}
      <div
        ref={navbarRef}
        className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-lg z-50 shadow-xl border-b border-slate-800"
      >
        <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="w-20 sm:w-32" />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-lg sm:text-xl font-bold text-indigo-300 drop-shadow-md animate-pulse">
              AI PR Reviewer
            </h1>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-white text-sm">
            <img src={user?.avatar} alt={`${user?.username}'s avatar`} className="w-9 h-9 rounded-full shadow-md" />
            <span className="text-xs sm:text-sm">{user?.username}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Landing Screen or Main Content */}
      {showLanding ? (
        <motion.div
          className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-slate-900 to-slate-800 text-indigo-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.05 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-wide drop-shadow-xl">AI PR Reviewer</h1>
            <p className="text-lg sm:text-xl mt-4 text-indigo-400">Initializing intelligence...</p>
          </motion.div>
        </motion.div>
      ) : (
        <div
          style={{ paddingTop: `${navbarHeight}px` }}
          className="min-h-screen pb-10 bg-gradient-to-b from-slate-900 to-black px-4 sm:px-6 md:px-12 text-gray-100 font-mono"
        >
          <motion.div
            className="w-full max-w-6xl mx-auto bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-10 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Assigned PRs */}
            <div className="bg-slate-800 p-4 rounded-xl shadow-md text-white mb-4">
              <h2 className="text-lg font-semibold mb-2">Your Assigned PRs</h2>
              <ul className="space-y-2 max-h-60 overflow-auto">
                {Array.isArray(pullRequests) ? (
                  pullRequests.length === 0 ? (
                    <li className="text-sm text-gray-400">No PRs assigned</li>
                  ) : (
                    pullRequests.map((pr, index) => (
                      <li
                        key={index}
                        className="border border-slate-600 p-2 rounded-md hover:bg-slate-700 cursor-pointer"
                        onClick={() => {
                          setRepo(`${pr.repoOwner}/${pr.repoName}`);
                          setPrNumber(pr.number);
                        }}
                      >
                        <div className="font-bold">{pr.title}</div>
                        <div className="text-sm text-gray-400">
                          {pr.repoOwner}/{pr.repoName} • #{pr.number}
                        </div>
                      </li>
                    ))
                  )
                ) : (
                  <li className="text-sm text-red-400">Invalid pull request data</li>
                )}
              </ul>
            </div>
  
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="w-full sm:flex-1 h-10 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-gray-400"
                  placeholder="owner/repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                />
                <input
                  className="w-full sm:w-24 h-10 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-gray-400"
                  placeholder="PR #"
                  value={prNumber}
                  onChange={(e) => setPrNumber(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleFetchPR}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded"
                >
                  Fetch PR
                </button>
              </div>
  
              {/* Fetched Files */}
              {fetchedFiles.length > 0 && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <h2 className="text-indigo-300 font-semibold text-sm">
                      Fetched PR Files ({fetchedFiles.length})
                    </h2>
                    <button
                      onClick={() => setFetchedFiles([])}
                      className="text-red-400 hover:text-red-300 text-xs underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="overflow-auto max-h-64">
                    {fetchedFiles.map((file, i) => (
                      <div key={file.filename || i} className="mb-4">
                        <p className="text-xs font-semibold text-cyan-300 mb-1">{file.filename}</p>
                        <Highlight className="diff text-xs bg-black p-2 rounded overflow-x-auto block">
                          {file.patch}
                        </Highlight>
                        <button
                          onClick={() => navigator.clipboard.writeText(file.patch)}
                          className="text-cyan-300 hover:underline mt-1 text-xs"
                        >
                          Copy Patch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Code Input */}
              <textarea
                rows={10}
                className={`w-full min-w-0 p-4 text-sm rounded-xl font-mono bg-slate-700 text-gray-100 border ${
                  charCount > MAX_LENGTH ? "border-red-400" : "border-indigo-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                placeholder="Paste your code here..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  localStorage.setItem("aiInputcode", e.target.value);
                }}
              />
              <div className="text-right text-xs text-indigo-300">
                {charCount}/{MAX_LENGTH}
              </div>
  
              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
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
            </form>
  
            {/* AI Message */}
            {loading && (
              <div className="text-center mt-4">
                <div className="text-4xl animate-bounce mb-2">🤖</div>
                <p className="text-sm text-indigo-300 animate-pulse">{aiMessage}</p>
              </div>
            )}
  
            {/* Error */}
            {error && <div className="bg-red-200 text-red-800 p-2 rounded text-sm mt-2">{error}</div>}
  
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-indigo-300">AI Suggestions</h2>
                <ul className="space-y-4">
                  {suggestions.map((s, i) => (
                    <li key={i} className="bg-slate-700 p-4 rounded-xl border border-slate-600">
                      <p className="text-sm text-indigo-300 mb-2">{s.comment}</p>
                      {s.code && (
                        <>
                          <Highlight className="javascript text-sm text-gray-100 bg-black p-2 rounded overflow-x-auto block">
                            {s.code}
                          </Highlight>
                          <button
                            onClick={() => handleCopy(s.code, i)}
                            className="text-cyan-300 mt-2 hover:underline text-xs"
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
  
            {/* History Section */}
            <hr className="my-6 border-slate-700" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-300">Review History</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-indigo-400 hover:underline">
                  {showHistory ? "Hide History" : "View History"}
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={!history.length}
                  className={`text-sm text-red-400 hover:underline ${
                    !history.length ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  Clear History
                </button>
              </div>
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
                <div className="overflow-auto max-h-80 border border-slate-700 rounded-xl p-4">
                  {filteredHistory.length === 0 ? (
                    <p className="text-slate-400">No matching history found.</p>
                  ) : (
                    filteredHistory.map((item, i) => (
                      <div key={item._id} className="mb-4 border border-slate-600 p-4 rounded-xl bg-slate-800">
                        <p className="text-xs text-slate-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                        <pre className="bg-slate-900 text-white text-xs p-2 rounded mt-2 overflow-x-auto">
                          {item.code}
                        </pre>
                        <ul className="mt-2 text-sm text-indigo-300 space-y-1">
                          {item.suggestions.map((s, j) => (
                            <li key={j}>{s.comment}</li>
                          ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2 text-xs">
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
                              await axios.delete(`${API}/api/history/${item._id}`);
                              setHistory((prev) => prev.filter(h => h._id !== item._id));
                            }}
                            className="text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );  
};

export default Reviewer;

