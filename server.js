const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

let db;

const initialData = {
  "appName": "Service Dashboard",
  "links": [
    { "id": "1", "title": "Uptime Kuma", "url": "http://status.local", "description": "Self-hosted monitoring tool for all your services.", "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iIzE2MTYxOCIvPjxwYXRoIGZpbGw9IiM1MEQzQTkiIGQ9Ik0xMjggMjA2Yy00My4wMzMgMC03OC0zNC45NjctNzgtNzhzMzQuOTY3LTc4IDc4LTc4IDc4IDM0Ljk2NyA3OCA3OC0zNC45NjcgNzgtNzhaIi8+PHBhdGggZmlsbD0iIzE2MTYxOCIgZD0iTTE2MS4xMjkgMTU3LjY3MmMtNi40NzIgMS4xMTUtMTMuMDcxIDEuNzI0LTE5LjgyMiAxLjcyNC0xNS41MzIgMC0yOS4xNzItNC41MzctNDEuNTI0LTEyLjMyMy0yLjU0LTEuNzA0LTQuNzc1LTMuNzItNi41NjctNi4wMDcgMy4wMDQtNC42MzYgNy4xMjUtOC43MTIgMTIuMDYtMTEuOTI3IDguNTQtNS41NzIgMTguODY0LTguNzM4IDI5Ljk4OC04LjczOCA4LjY0NSAwIDE2Ljc4MyAyLjA1MyAyMy44MzggNS43MzIgMS44NjcuOTYgMy42NzcgMi4wMDggNS40MDcgMy4xNDIgMS4wNTQgMS44MTQgMS45MzggMy43MzggMi42MzEgNS43NDgtMy4xMDYgMi4yMTUtNi41ODMgNC4xMDItMTAuMzU4IDUuNTg5WiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNDQuNDEzIDEyMy44MDNjLjU2Ni0yLjQxMi44NzEtNC45MzEuODcxLTcuNTQ4IDAtMTEuOTY0LTUuNDEzLTIyLjc3LTEzLjg3My0yOS45NzgtMi4zMDMtMS45ODUtNC44NjktMy43MzMtNy42NjEtNS4xOTYtNC4wMDItMi4xNDMtOC40NDgtMy4yMjMtMTMuMjI1LTMuMjIzLTguMjYyIDAtMTUuODUgMi43MjMtMjIuMDY0IDcuNDQyLTUuNTUgNC4yMDItOS44NTggOS45MTUtMTEuOTg1IDE2LjQ0IDQuNDM1LTMuMDQ4IDkuNjYyLTQuODEgMTUuMzItNC44MSAxMi4zNTggMCAyMi45MzYgNi40NjIgMjguNjIgMTUuOTQ2Yy0xMS4wMjggNS44MzMtMTguMDk3IDE3LjQxOC0xOC4wOTcgMzAuODU3IDAgMi4zOTIuMjUgNC43MjMuNzMgNi45NzQgNy4zNTIgMTAuOTIgMTkuNDIzIDE4LjA2NyAzMy4xMzMgMTguMDY3IDE0LjQzMyAwIDI3LjE0My03Ljg5MiAzNC4yMTUtMTkuNTQyLTIuODYyLTYuMjEzLTguMDcxLTExLjQyLTE0LjU2LTE0LjYxWiIvPjwvc3ZnPg==", "type": "service", "enabled": true, "category": "Monitoring", "proxyConfig": { "target": "http://localhost:3001", "enableSsl": false, "sslCertPath": "", "sslKeyPath": "", "enableWebSockets": true } },
    { "id": "2", "title": "Bitwarden (Vaultwarden)", "url": "http://vault.local", "description": "Self-hosted and open source password manager.", "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjUwLjY2NyAxMjEuNjA2VjY0LjQ4N2wtNTYuODMyLTMwLjc3YS45NzIuOTcyIDAgMCAwLS45NzIgMGwtNTYuODMzIDMwLjc2OWEyLjA4MyAyLjA4MyAwIDAgMC0xLjA0MiAxLjgzM3Y0Ny4xMDVsLTQxLjYxIDIzLjg1MmEuODQ4Ljg0OCAwIDAgMC0uNDM0Ljc0N3YxMi41NTNhLjg0OC44NDggMCAwIDAgLjQzNC43NDdsNDEuNTY4IDIzLjkxMXY0Ni45OTdjMCAuODQuNSAxLjYyIDEuMjUgMS45NDNsNTYuNzggMzAuNjU4Yy4yMy4xMjQuNDc4LjE4Ni43MjYuMTg2YT MS4wMDYgMS4wMDYgMCAwIDAgLjcyNi0uMjg4bDU2Ljc4LTMwLjU1MmEuOTk0Ljk5NCAwIDAgMCAuNzMyLTEuODM0di01NC4yMmwyOS4yMDMtMTYuNzY0Yy4yNTMtLjE0Ni40MTMtLjQyMi40MTMtLjcyOHYtMTIuNTU1Yy4wMDItLjMwNi0uMTU5LS41ODItLjQxMy0uNzI4bC0yOS4xNi0xNi44MjRaIiBmaWxsPSIjMTc1RTgxIi8+PHBhdGggZD0iTTE5My44MzUgMzMuNzE3IDM4LjY1十六章ExLjYwNmw0Mi4wNDMgMjQuMjE2IDEzNi42NzgtNzguMjg0YS45NzIuOTcyIDAgMCAwLS4yMS0xLjczN2wtMjMuMzMzLTEzLjUxM1ptLTk2LjMyIDk0LjIxOCAxOC44OTgtMTAuOTExIDExLjA0MSA2LjM2Ny0xOC44OTggMTAuOTExLTExLjA0MS02LjM2N1ptMjIuMDggNDMuMDc4LTQ0LjE2Ni0yNS40NjIgMTEuMDQtNi4zNjcgNDQuMTY2IDI1LjQ2Mi0xMS4wNCA2LjM2N1ptMTEuNzY3LTIwLjM3MS0xOC44OTgtMTAuOTExIDExLjA0LTYuMzY3IDE4Ljg5OCAxMC45MTEtMTEuMDQgNi4zNjZ6bTQ0LjE2NiAyNS40NjItMTEuMDQtNi4zNjcgMTguODk4LTEwLjkxMSAxMS4wNCA2LjM2Ny0xOC44OTggNS42MjVaIiBmaWxsPSIjOThDQUZGIi8+PHBhdGggZD0iTTM4LjY1十六章ExLjYwNiAxOTMuODM1IDMzLjcxN2wyMy4zMzMgMTMuNTEzYy0yLjc5IDEuNjA4LTE0NC40OSA4Mi40ODgtMTQ0LjQ5IDgyLjQ4OGwtMzIuMDU3LTE4LjRhLjg0OC44NDggMCAwIDEtLjQzNC0uNzQ3di0xMi41NTRjLS4wMDEtLjMyNiAuMTU4LS4xMDMuNDEzLS43NDhaIiBmaWxsPSIjNTY2MjEyIi8+PC9zdmc+", "type": "service", "enabled": true, "category": "Security", "proxyConfig": { "target": "http://localhost:8088", "enableSsl": false, "sslCertPath": "", "sslKeyPath": "", "enableWebSockets": true } },
    { "id": "3", "title": "Moodle LMS", "url": "https://moodle.example.com", "description": "Central course management and learning platform.", "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQ5LjM3MyAxMjAuNjMyYy0xLjQ0OC0xNC4yMDItMTMuNjgxLTI2LjQzNS0yNy44ODMtMjcuODgzLTE0LjIwMy0xLjQ0Ny0yNy43NDEgNC41MzctMzYuNDU1IDE1LjYxNmwtNzMuNDIzIDc2LjY2OWE3LjM2NyA3LjM2NyAwIDAgMS0xMC42NzQgMGwtMTMuODEtMTQuNDE2YTM3LjA0NiAzNy4wNDYgMCAwIDAtMjYuMTQyLTEwLjg2NCAzNy4wNDYgMzcuMDQ2IDAgMCAwLTI2LjE0MiAxMC44NjQgMzcuMDQ2IDM3LjA0NiAwIDAgMC0xMC44NjQgMjYuMTQyYzAgMTIuMTIzIDYuMzU1IDIyLjY3IDE1LjYxNiAzMC4zMDlsMzMuNDEzIDMzLjQxM2ExMC40MDggMTAuNDA4IDAgMCAwIDcuMzY3IDMuMDUyaDIuMDg0YTEwLjQwOCAxMC40MDggMCAwIDAgNy4zNjctMy4wNTJsMTYuNzY4LTE2Ljc2OGExMC40MDggMTAuNDA4IDAgMCAxIDE0LjczMyAwbDU0LjgwNyA1NC44MDhhMTAuNDA4IDEwLjQwOCAwIDAgMCAxNC43MzQgMEwyNDYuMzIgMTY3LjAzNGMzMC4xNjgtMzIuMDk1IDE4LjQzLjg2OCAyLjg4My00Ni4yMy0uMTctLjE3LS4zNC0uMzQtLjUxLS41MWEzNy4xMjIgMzcuMTIyIDAgMCAwLTEzLjU4OS05LjY0NCAzNy4xMjIgMzcuMTIyIDAgMCAwLTE2LjkzOC0zLjIzNWMtNC4xNjggMC04LjE2Ny44NS0xMS44NDIgMi4zOUwxNTQuNCAxMjEuNDgyYy0xLjcxIDEuNTQtMy4wOCAzLjYxLTQuMDYgNS45N2wtMTIuMDExIDI5LjExOWE1LjIwNSA1LjIwNSAwIDAgMS04LjY4LS44NWwtMjYuMTQyLTYzLjkwOWMuMDMyLS4xMTIuMDYtLjIyNC4wOS0uMzM2IDEuMjc4LTMuNzQgMy42NTUtNi45NzcgNi44MzYtOS40NzYgMTUuMDgtMTEuODQyIDM1LjU3My03Ljg1MyA0Ni4wNTktMTAuNjk0IDYuMTgxLTEuNjg2IDE0LjI4Ny0yLjQxMyAyMi41NjIuNTEgMTMuMDQgNC42NzUgMjEuNTIgMTcuOTk1IDIyLjQ3OCAzMS43ODdaIiBmaWxsPSIjRjY3QjIwIi8+PC9zdmc+", "type": "link", "enabled": true, "category": "Education" },
    { "id": "4", "title": "Portainer CE", "url": "http://docker.local", "description": "Lightweight management UI for Docker environments.", "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQ1LjMzMyAxMDguMDIyYy02LjM1Ny0zOS4xOTQtNDAuNjA0LTcwLjAyMi04Mi4yNC03MC4wMjItNDEuNjM1IDAtNzUuODgzIDMwLjgzOC04Mi4yNCA3MC4wMjJINzguNnY3NS42MDNoMTguNjcxdjM0LjM1NGg1OC4yNXYtMzQuMzU0aDE4LjY3MXYtNzUuNjAzaC0yLjEzNVoiIGZpbGw9IiMxM0JFRDAiLz48cGF0aCBkPSJNNzguNiAxODMuNjI1VjEwOC4wMjJIMTEuMjQ1Yy02LjM1NyAzOS4xOTQtMi4zNDcgODAuMzkyIDIyLjU4MiAxMDkuMDQzIDMyLjYyMyAzNy44NDIgODMuMzIgNDQuMTkzIDEyMy44NDggMTUuNjY3bDI4LjEwNy0yOC4yNDMtMzMuMDU3LTMwLjg2NVoiIGZpbGw9IiMxM0JFRDAiIG9wYWNpdHk9Ii42Ii8+PC9zdmc+", "type": "service", "enabled": true, "category": "Infrastructure", "proxyConfig": { "target": "http://localhost:9000", "enableSsl": false, "sslCertPath": "", "sslKeyPath": "", "enableWebSockets": false } },
    { "id": "5", "title": "Home Assistant", "url": "http://home.local", "description": "Open source home automation that puts local control first.", "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQ2LjgzIDEzMS45MDNjLTYuNzg2LTM4LjA1Ny0zOS4xMTYtNjcuMDI0LTc5Ljc4My02Ny4wMjQtMzkuOTY2IDAtNzMuMDk1IDI4Ljk2Ny03OS43ODIgNjcuMDI0SDcuNDg3djY5LjM4aDEzLjc2OHYyOS41NTNoNDguMTI4di0yOS41NTNoOTUuODgydjI5LjU1M2g0OC4xMjd2LTI5LjU1M2gxMy43Njd2LTY5LjM4aC0xMi4yMTRaIiBmaWxsPSIjNDFCQUZGIi8+PHBhdGggZD0iTTguMTUgMTMxLjkwM2M2Ljc4Ni0zOC4wNTYgNDQuMTg2LTY4LjA3IDg3LjczOC02OC4wNyA0My41NTIgMCA4MC45NTIgMy4wNDcgODcuNzM4IDY4LjA3SDguMTVabTIzMy4yNjYgNDMuMzU2Yy0xMS43LTEzLjEzMi0zNC41MjItMjEuNDIyLTU2LjczOC0yMS40MjItMjIuMjE2IDAtNDUuMDM4IDguMjktNTYuNzM4IDIxLjQyMnYtMjIuOTY3aDExMy40NzZ2MjIuOTY3WiIgZmlsbD0iI0ZGRiIgb3BhY2l0eT0iLjc1KSIvPjwvc3ZnPg==", "type": "service", "enabled": true, "category": "Home Automation", "proxyConfig": { "target": "http://localhost:8123", "enableSsl": false, "sslCertPath": "", "sslKeyPath": "", "enableWebSockets": true } },
    { "id": "6", "title": "React Documentation", "url": "https://react.dev", "description": "The official documentation for the React library.", "icon": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K", "type": "link", "enabled": false, "category": "Development" }
  ]
};

async function initializeDatabase() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      type TEXT NOT NULL CHECK(type IN ('link', 'service')),
      enabled BOOLEAN NOT NULL DEFAULT 1,
      category TEXT,
      proxyConfig TEXT
    );
  `);

  // Seed data if database is empty
  const count = await db.get('SELECT COUNT(*) as count FROM links');
  if (count.count === 0) {
    console.log('Database is empty, seeding initial data...');
    await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', 'appName', initialData.appName);
    const stmt = await db.prepare('INSERT INTO links (id, title, url, description, icon, type, enabled, category, proxyConfig) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const link of initialData.links) {
      await stmt.run(
        link.id,
        link.title,
        link.url,
        link.description,
        link.icon,
        link.type,
        link.enabled,
        link.category || null,
        link.proxyConfig ? JSON.stringify(link.proxyConfig) : null
      );
    }
    await stmt.finalize();
    console.log('Seeding complete.');
  }
}

// API to get all data
app.get('/api/data', async (req, res) => {
  try {
    const appNameResult = await db.get("SELECT value FROM settings WHERE key = 'appName'");
    const linksResult = await db.all("SELECT * FROM links ORDER BY title");
    
    const links = linksResult.map(link => ({
      ...link,
      enabled: !!link.enabled,
      proxyConfig: link.proxyConfig ? JSON.parse(link.proxyConfig) : null,
    }));

    res.json({
      appName: appNameResult?.value || 'Service Dashboard',
      links: links,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// API to add multiple links (for parser)
app.post('/api/links/batch', async (req, res) => {
    const links = req.body;
    if (!Array.isArray(links) || links.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Expected an array of links.' });
    }

    try {
        const stmt = await db.prepare('INSERT INTO links (id, title, url, description, icon, type, enabled, category, proxyConfig) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const newLinks = [];
        for (const link of links) {
            await stmt.run(
                link.id,
                link.title,
                link.url,
                link.description,
                link.icon,
                link.type,
                link.enabled,
                link.category || null,
                link.proxyConfig ? JSON.stringify(link.proxyConfig) : null
            );
            newLinks.push(link);
        }
        await stmt.finalize();
        res.status(201).json(newLinks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add links', details: error.message });
    }
});


// API to update a link
app.put('/api/links/:id', async (req, res) => {
  const { id } = req.params;
  const { title, url, description, icon, type, enabled, category, proxyConfig } = req.body;
  
  try {
    await db.run(
      'UPDATE links SET title = ?, url = ?, description = ?, icon = ?, type = ?, enabled = ?, category = ?, proxyConfig = ? WHERE id = ?',
      title, url, description, icon, type, enabled, category, proxyConfig ? JSON.stringify(proxyConfig) : null, id
    );
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update link', details: error.message });
  }
});

// API to delete a link
app.delete('/api/links/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM links WHERE id = ?', id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete link', details: error.message });
  }
});


// API to update app name
app.put('/api/settings/appName', async (req, res) => {
  const { appName } = req.body;
  try {
    await db.run("UPDATE settings SET value = ? WHERE key = 'appName'", appName);
    res.json({ appName });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update app name', details: error.message });
  }
});

// Serve the main index.html for any other GET request to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
