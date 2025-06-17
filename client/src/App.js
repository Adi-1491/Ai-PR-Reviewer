import React, { useState, useEffect } from "react";
import axios from "axios";
import Highlight from "react-highlight";
import 'highlight.js/styles/github.css';

const App = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const MAX_LENGTH = 1000;
  const charCount = code.length;

  useEffect(() => {
    const savedSuggestions = localStorage.getItem("aiSuggestions");
    const savedInput = localStorage.getItem("aiInputcode");
    if (savedSuggestions) {
      setSuggestions(JSON.parse(savedSuggestions));
    }
    if (savedInput) {
      setCode(savedInput);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("aiReviewHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuggestions([]);

    if (!code.trim()) {
      setError("⚠️ Please enter code for review.");
      return;
    }

    if (code.length > MAX_LENGTH) {
      setError("Code too long. Please keep it under 1000 characters.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/api/review", { code });
      setSuggestions(res.data.suggestions);
      localStorage.setItem("aiSuggestions", JSON.stringify(res.data.suggestions));
      saveReviewHistory(code, res.data.suggestions);
    } catch (err) {
      setError("❌ Failed to connect to server.");
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

  const handleClearHistory = () => {
    setShowHistory(false);
    setHistory([]);
    localStorage.removeItem('aiReviewHistory');
  }

  const saveReviewHistory = (code, suggestions) => {
    const newReview = {
      code,
      suggestions,
      timestamp: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("aiReviewHistory")) || [];
    const updated = [newReview, ...existing];
    localStorage.setItem("aiReviewHistory", JSON.stringify(updated));
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">🧠 AI PR Reviewer</h1>
          <p className="text-gray-500 text-sm">Paste your code below and let AI review it for you.</p>
        </div>

        {/* TOGGLE HISTORY */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {showHistory ? "Hide History" : "View History"}
          </button>
          <button
            onClick={handleClearHistory}
            className="text-red-500 hover:underline text-sm font-medium"
          >
            Clear History
          </button>
        </div>

        {/* HISTORY LIST */}
        {showHistory && history.length > 0 && (
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Past Reviews</h2>
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((item, i) => (
                <li key={i} className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white">
                  <p className="text-sm text-gray-500">🕓 {new Date(item.timestamp).toLocaleString()}</p>

                  <pre className="bg-gray-100 p-3 rounded text-xs mt-2 overflow-x-auto">
                    <code>{item.code}</code>
                  </pre>

                  {item.suggestions.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {item.suggestions.map((s, j) => (
                        <li key={j} className="text-sm text-gray-800">
                          💡 {s.comment}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                  onClick={() => {
                    setCode(item.code);
                    setSuggestions(item.suggestions);
                    localStorage.setItem("aiInputCode",item.code);
                    localStorage.setItem("aiSuggestions", JSON.stringify(item.suggestions));
                    setShowHistory(false);
                  }}
                    className="text-blue-600 hover:underline text-sm font-medium mt-2"
                  >
                    Reopen Review
                  </button>
                  <button
                  onClick={()=>{
                    const updated = history.filter((_,index) => index !== i);
                    setHistory(updated);
                    localStorage.setItem("aiReviewHistory",JSON.stringify(updated));
                  }}
                  className="text-red-500 hover:underline text-sm font-medium mt-2 ml-4"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={10}
            className={`w-full p-4 border ${
              charCount > MAX_LENGTH ? "border-red-400" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y`}
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              localStorage.setItem("aiInputcode", e.target.value);
            }}
          />
          <div className="text-right text-sm text-gray-500">
            <span className={charCount > MAX_LENGTH ? "text-red-500" : ""}>
              {charCount}/{MAX_LENGTH}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 text-white rounded-lg font-semibold transition-all ${
                loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
              disabled={loading}
            >
              {loading ? "Reviewing..." : "Review Code"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="animate-shake mt-2 text-sm bg-red-100 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
        </form>

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Suggestions</h2>
            <ul className="space-y-4">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    💡 <span>{s.comment}</span>
                  </p>
                  {s.code && (
                    <>
                      <pre className="mt-2 bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                        <Highlight className="">{s.code}</Highlight>
                      </pre>
                      <button
                        onClick={() => handleCopy(s.code, i)}
                        className="mt-2 text-sm text-blue-600 hover:underline"
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
  );
};

export default App;
