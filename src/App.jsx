import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [websites, setWebsites] = useState(() => {
    const savedWebsites = localStorage.getItem('customWebsites');
    return savedWebsites ? JSON.parse(savedWebsites) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [editingIndex, setEditingIndex] = useState(null); // New state for editing

  useEffect(() => {
    localStorage.setItem('customWebsites', JSON.stringify(websites));
  }, [websites]);

  const handleAddWebsite = () => {
    if (newWebsiteName && newWebsiteUrl) {
      // Attempt to construct a favicon URL
      let iconUrl = '';
      try {
        const url = new URL(newWebsiteUrl);
        iconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
      } catch (error) {
        console.error("Invalid URL for favicon: ", error);
        // Fallback to empty string if URL is invalid
        iconUrl = '';
      }

      if (editingIndex !== null) {
        // Update existing website
        const updatedWebsites = websites.map((site, index) =>
          index === editingIndex ? { name: newWebsiteName, url: newWebsiteUrl, iconUrl: iconUrl } : site
        );
        setWebsites(updatedWebsites);
        setEditingIndex(null);
      } else {
        // Add new website
        setWebsites([...websites, { name: newWebsiteName, url: newWebsiteUrl, iconUrl: iconUrl }]);
      }

      setNewWebsiteName('');
      setNewWebsiteUrl('');
      setShowAddForm(false);
    }
  };

  const handleRemoveWebsite = (indexToRemove) => {
    setWebsites(websites.filter((_, index) => index !== indexToRemove));
  };

  const handleEditWebsite = (indexToEdit) => {
    setEditingIndex(indexToEdit);
    setNewWebsiteName(websites[indexToEdit].name);
    setNewWebsiteUrl(websites[indexToEdit].url);
    setShowAddForm(true);
  };

  return (
    <div className="App">
      <h1>Choose a Game</h1>
      <div className="game-grid">
        <a href="/games/rock_paper_scissor/index.html" target="_blank" rel="noopener noreferrer" className="game-card">
          <img src="/images/rock-paper-scissors.png" alt="Rock Paper Scissors Icon" className="game-icon" />
          <p>Rock Paper Scissors</p>
        </a>
        <a href="/games/tic_tac_toe/index.html" target="_blank" rel="noopener noreferrer" className="game-card">
          <img src="/images/tic-tac.png" alt="Tic Tac Toe Icon" className="game-icon" />
          <p>Tic Tac Toe</p>
        </a>
        <a href="/games/Connect_four/index.html" target="_blank" rel="noopener noreferrer" className="game-card">
          <img src="/images/connect-four.png" alt="Connect Four Icon" className="game-icon" />
          <p>Connect Four</p>
        </a>
        <a href="/games/Maze_runner/index.html" target="_blank" rel="noopener noreferrer" className="game-card">
          <img src="/images/maze.png" alt="Maze Runner Icon" className="game-icon" />
          <p>Maze Runner</p>
        </a>
        <a href="/games/Tetris/index.html" target="_blank" rel="noopener noreferrer" className="game-card">
          <img src="/images/tetris.png" alt="Tetris Icon" className="game-icon" />
          <p>Tetris</p>
        </a>
        <a href="/games/super_mario/index.html" target="_blank" rel="noopener noreferrer" className="game-card">
          <img src="/images/supermario.png" alt="Super Mario Icon" className="game-icon" />
          <p>Super Mario</p>
        </a>
      </div>

      <button className="add-website-btn" onClick={() => {
        setShowAddForm(!showAddForm);
        if (showAddForm) { // If closing the form, reset editing state
          setEditingIndex(null);
          setNewWebsiteName('');
          setNewWebsiteUrl('');
        }
      }}>
        {showAddForm ? '✖️ Cancel' : '➕ Add Custom Website'}
      </button>

      {showAddForm && (
        <div className="add-website-form">
          <input
            type="text"
            placeholder="Website Name"
            value={newWebsiteName}
            onChange={(e) => setNewWebsiteName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Website URL (e.g., https://example.com)"
            value={newWebsiteUrl}
            onChange={(e) => setNewWebsiteUrl(e.target.value)}
          />
          <button onClick={handleAddWebsite}>{editingIndex !== null ? 'Update' : 'Add'}</button>
        </div>
      )}

      {websites.length > 0 && (
        <div className="custom-websites-list">
          <h2>Custom Websites</h2>
          <ul>
            {websites.map((site, index) => (
              <li key={index}>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="custom-website-link">
                  {site.iconUrl && (
                    <img
                      src={site.iconUrl}
                      alt={`${site.name} favicon`}
                      className="website-favicon"
                      onError={(e) => { e.target.style.display = 'none'; }} // Hide if loading fails
                    />
                  )}
                  {site.name}
                </a>
                <div className="website-actions">
                  <button onClick={() => handleEditWebsite(index)} className="edit-btn">✏️ Edit</button>
                  <button onClick={() => handleRemoveWebsite(index)} className="remove-btn">🗑️ Remove</button>
                </div>
              </li>
            ))}
          </ul>
        
        </div>
      )}
    </div>
  );
}

export default App;