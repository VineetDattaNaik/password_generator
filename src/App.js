import './App.css';
import generatePassword from './utils/passwordGenerator';
import { useState, useEffect } from 'react';

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    alphabets: true,
    numbers: false,
    symbols: false
  });

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

        <input 
          type="text" 
          value={password} 
          readOnly 
          className="password-display"
          placeholder="Your password will appear here"
        />
        
        <button 
          onClick={handleGeneratePassword}
          className="generate-btn"
        >
          Generate Password
        </button>
      </div>
    </div>
  );
}

export default App;
