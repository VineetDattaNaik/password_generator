const express = require('express');
const cors = require('cors');
const db = require('./config/db.config');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Add debugging middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Helper function to log password history
async function logPasswordHistory(passwordId, action) {
  try {
    if (!passwordId || !action) {
      throw new Error('Password ID and action are required for history logging');
    }
    
    console.log(`Attempting to log history - Password ID: ${passwordId}, Action: ${action}`);
    
    const result = await db.query`
      INSERT INTO password_history (password_id, action) 
      VALUES (${passwordId}, ${action})
      RETURNING *
    `;
    
    if (!result || !result[0]) {
      throw new Error('Failed to insert history record');
    }
    
    console.log('History logged successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error logging password history:', error);
    throw error;
  }
}

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Password history route
app.get('/api/history', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        ph.id,
        ph.password_id,
        p.password_value,
        ph.action,
        ph.action_timestamp,
        p.label
      FROM password_history ph
      LEFT JOIN passwords p ON ph.password_id = p.id
      ORDER BY ph.action_timestamp DESC
    `);
    
    const passwordHistory = result.rows; // Access the rows property
    console.log('Retrieved password history:', passwordHistory.length, 'records');
    res.json(passwordHistory);
  } catch (error) {
    console.error('Error fetching password history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch password history',
      details: error.message 
    });
  }
});

// Get all passwords
app.get('/api/passwords', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM passwords ORDER BY created_at DESC');
    const passwords = result.rows;
    console.log('Retrieved passwords:', passwords.length, 'records');
    res.json(passwords);
  } catch (error) {
    console.error('Database error details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch passwords',
      details: error.message,
      code: error.code
    });
  }
});

// Save new password
app.post('/api/passwords', async (req, res) => {
  const { password_value, length, has_alphabets, has_numbers, has_symbols, description, label } = req.body;
  
  try {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Let PostgreSQL handle the id generation
      const result = await client.query(
        `INSERT INTO passwords (
          password_value, 
          length, 
          has_alphabets, 
          has_numbers, 
          has_symbols, 
          description, 
          label
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, password_value, label`,  // Return only needed fields
        [
          password_value, 
          length, 
          has_alphabets || false, 
          has_numbers || false, 
          has_symbols || false, 
          description || null, 
          label || 'Unnamed Password'
        ]
      );
      
      const password = result.rows[0];
      console.log('Password saved with ID:', password.id);
      
      // Add history record with the new password's label
      await client.query(
        `INSERT INTO password_history (password_id, action, password_label) 
        VALUES ($1, $2, $3)`,
        [password.id, 'CREATE', password.label]
      );
      
      await client.query('COMMIT');
      res.status(201).json(password);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in /api/passwords POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete password
app.delete('/api/passwords/:id', async (req, res) => {
  const passwordId = req.params.id;
  
  try {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO password_history (password_id, action) VALUES ($1, $2)',
        [passwordId, 'DELETE']
      );
      
      const result = await client.query(
        'DELETE FROM passwords WHERE id = $1 RETURNING *',
        [passwordId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Password not found');
      }
      
      await client.query('COMMIT');
      console.log('Password deleted successfully:', passwordId);
      res.status(204).send();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in /api/passwords DELETE:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- GET /api/history');
  console.log('- GET /api/passwords');
  console.log('- POST /api/passwords');
  console.log('- DELETE /api/passwords/:id');
});
