import React, { useState } from 'react'
import axios from "axios";

const App = () => {
  const [code,setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const res = await axios.post(
        'http://localhost:5001/api/review',
        { code },
        {
          headers: { 'Content-Type': 'application/json' },
        }
    );

      const data = res.data;
      setSuggestions(data.suggestions);
    } catch(err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
  }
};
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>AI PR Reviewer</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows= "10"
          style={{width: '100%', padding: '1rem'}}
          placeholder='Paste your code here...'
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type='submit' style={{ marginTop: '1rem', padding: '0.5rem 1rem '}}>
          Review Code
        </button>
      </form>
      {loading && <p>Reviewing code...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {suggestions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Suggestions:</h2>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>
                <p><strong>Comment:</strong> {s.comment}</p>
                {s.code && (
                  <pre style={{ background: '#f4f4f4', padding: '0.5rem' }}>
                    <code>{s.code}</code>
                  </pre>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App