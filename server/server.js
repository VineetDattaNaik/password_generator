require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize database before starting server
async function startServer() {
  try {
    await db.initialize();
    
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
