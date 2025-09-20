const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
// Use a different port for the backend to avoid conflicts with frontend dev servers
const PORT = process.env.PORT || 3001; 
const DB_PATH = path.join(__dirname, 'db.json');

// --- Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors()); 
// Parse JSON bodies, increase limit for base64 icon data
app.use(express.json({ limit: '10mb' })); 
// Serve static frontend files (HTML, CSS, JS) from the root directory
app.use(express.static(path.join(__dirname)));

// --- API Routes ---
// GET /api/data: Read and return all data from db.json
app.get('/api/data', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading from db.json:', err);
            return res.status(500).json({ error: 'Failed to read data from the server.' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseErr) {
            console.error('Error parsing db.json:', parseErr);
            return res.status(500).json({ error: 'Data file on server is corrupt.' });
        }
    });
});

// POST /api/data: Receive data and write it to db.json
app.post('/api/data', (req, res) => {
    const dataToSave = JSON.stringify(req.body, null, 2);
    fs.writeFile(DB_PATH, dataToSave, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to db.json:', err);
            return res.status(500).json({ error: 'Failed to save data to the server.' });
        }
        res.json({ success: true, message: 'Data saved successfully.' });
    });
});

// --- Fallback Route ---
// For any other request, serve the main index.html file.
// This is useful for client-side routing, but also ensures the app loads correctly.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`✅ Backend server is running and accessible at http://localhost:${PORT}`);
});
