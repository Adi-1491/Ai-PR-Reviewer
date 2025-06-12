import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const MAX_LENGTH = 1000;
  const charCount = code.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuggestions([]);

    if (!code.trim()) {
      setError("⚠️ Please enter code for review.");
      return;
    }

    if(code.length > MAX_LENGTH) {
      setError('Code too long. Please keep it under 1000 characters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/api/review", { code });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      setError("❌ Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy =  async (codeSnippet, index) => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch(err)
    {
      console.error('Copy failed', err);
    }
  }

  const handleClear = () => {
    setCode('');
    setSuggestions([]);
    setError('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-10 px-4">
  <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl space-y-8">
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold text-gray-800">🧠 AI PR Reviewer</h1>
      <p className="text-gray-500 text-sm">Paste your code below and let AI review it for you.</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        rows={10}
        className={`w-full p-4 border ${
          charCount > MAX_LENGTH ? "border-red-400" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y`}
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
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
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
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
                    <code className="text-gray-800">{s.code}</code>
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
