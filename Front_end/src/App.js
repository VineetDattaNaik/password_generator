import './App.css';
import generatePassword from './utils/passwordGenerator';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    alphabets: true,
    numbers: false,
    symbols: false
  });
  // Initialize savedPasswords as an empty array
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  // Add error state
  const [error, setError] = useState(null);
  // Add password history state
  const [passwordHistory, setPasswordHistory] = useState([]);

  const fetchPasswords = async () => {
    try {
      console.log('Fetching from:', `${API_URL}/passwords`); // Debug log
      const response = await fetch(`${API_URL}/passwords`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Passwords data received:', data); // Debug log
      setSavedPasswords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      setError(`Failed to fetch passwords: ${error.message}`);
      setSavedPasswords([]);
    }
  };

  const fetchPasswordHistory = async () => {
    try {
      console.log('Fetching from:', `${API_URL}/history`); // Debug log
      const response = await fetch(`${API_URL}/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('History data received:', data); // Debug log
      setPasswordHistory(data);
    } catch (error) {
      console.error('Error fetching password history:', error);
      setError(`Failed to fetch history: ${error.message}`);
      setPasswordHistory([]);
    }
  };

  useEffect(() => {
    fetchPasswords();
    fetchPasswordHistory();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleGeneratePassword();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    // Cleanup listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);  // Empty dependency array since we don't need to re-add the listener

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(length, options);
    setPassword(newPassword);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      // Optional: You could add a temporary success message here
      setError('Password copied to clipboard!');
      setTimeout(() => setError(null), 2000); // Clear message after 2 seconds
    } catch (err) {
      setError('Failed to copy password');
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleSavePassword = async () => {
    try {
      const response = await fetch(`${API_URL}/passwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password_value: password,
          length,
          has_alphabets: options.alphabets,
          has_numbers: options.numbers,
          has_symbols: options.symbols,
          description,
          label
        }),
      });

      if (response.ok) {
        await fetchPasswords();
        await fetchPasswordHistory();
        setDescription('');
        setLabel('');
      } else {
        throw new Error('Failed to save password');
      }
    } catch (error) {
      console.error('Error saving password:', error);
      setError(error.message);
    }
  };

  const handleDeletePassword = async (id) => {
    try {
      const response = await fetch(`${API_URL}/passwords/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchPasswords();
        await fetchPasswordHistory();
      } else {
        throw new Error('Failed to delete password');
      }
    } catch (error) {
      console.error('Error deleting password:', error);
      setError(error.message);
    }
  };

  // const renderPasswordHistory = () => (
  //   <div className="password-history">
  //     <h2>Password History</h2>
  //     <div className="history-list">
  //       {passwordHistory.map((entry) => (
  //         <div key={entry.id} className="history-item">
  //           {/* <strong>{entry.label || 'Unnamed Password'}</strong> */}
  //           <span className={`action ${entry.action.toLowerCase()}`}>
  //             {entry.action}
  //           </span>
  //           <span className="timestamp">
  //             {new Date(entry.action_timestamp).toLocaleString()}
  //           </span>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  const renderSavedPasswords = () => (
    <div className="saved-passwords">
      <h2>Saved Passwords</h2>
      <div className="passwords-list">
        {Array.isArray(savedPasswords) && savedPasswords.length > 0 ? (
          savedPasswords.map((saved) => (
            <div key={saved.id} className="saved-password-item">
              <div className="password-info">
                <strong>{saved.label || 'Unnamed Password'}</strong>
                {saved.description && <p>{saved.description}</p>}
                <code onClick={() => {
                  navigator.clipboard.writeText(saved.password_value);
                  // Optional: Add a toast notification here
                }}>
                  {saved.password_value}
                </code>
              </div>
              <button 
                onClick={() => handleDeletePassword(saved.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No saved passwords yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="App">
      <div className="password-generator">
        <h1 className="title">Password Generator</h1>
        
        <div className="length-container">
          <label>
            Password Length:
            <input
              type="number"
              // value={length}
              onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 1))}
              className="length-input"
              min="1"
              max="50"
            />
          </label>
        </div>
        
        <div className="options-container">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.alphabets}
              onChange={() => handleOptionChange('alphabets')}
              className="checkbox"
            />
            Include Alphabets
          </label>
          
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={() => handleOptionChange('numbers')}
              className="checkbox"
            />
            Include Numbers
          </label>
          
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={() => handleOptionChange('symbols')}
              className="checkbox"
            />
            Include Symbols
          </label>
        </div>

        <div className="password-actions">
          <input 
            type="text" 
            value={password} 
            readOnly 
            className="password-display"
            placeholder="Your password will appear here"
          />
          
          <div className="button-group">
            <button 
              onClick={handleGeneratePassword}
              className="generate-btn"
            >
              Generate Password
            </button>
            
            <button 
              onClick={handleCopyPassword}
              className="copy-btn"
              disabled={!password}
            >
              Copy Password
            </button>
          </div>
        </div>

        {/* New save password section */}
        <div className="save-password-section">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter label"
            className="text-input"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="text-input"
          />
          <button 
            onClick={handleSavePassword}
            className="save-btn"
            disabled={!password}
          >
            Save Password
          </button>
        </div>

        {/* Add error message if exists */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Render saved passwords and history */}
        {renderSavedPasswords()}
        {/* {renderPasswordHistory()} */}
      </div>
    </div>
  );
}

export default App;
