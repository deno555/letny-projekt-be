const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('events.db', (err) => {
	if (err) {
		console.error(err.message);
	} else {
		console.log('Running');

		db.run(`
			CREATE TABLE IF NOT EXISTS events (
				id INTEGER PRIMARY KEY,
				name TEXT
			)
		`);

		db.run(`
			CREATE TABLE IF NOT EXISTS event_details (
				id INTEGER PRIMARY KEY,
				event_id INTEGER,
				aboutText TEXT,
				notifications TEXT,
				feedback TEXT,
				photos TEXT,
				schedule TEXT,
				FOREIGN KEY (event_id) REFERENCES events (id)
			)
		`);
	}
});

//get events
app.get('/events', (req, res) => {
	db.all('SELECT * FROM events', (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json(rows);
	});	
});

//add events
app.post('/events', (req, res) => {
	const { name } = req.body;
	if (!name) {
		return res.status(400).json({ error: 'Name is required' });
	}

	db.run('INSERT INTO events (name) VALUES (?)', [name], function (err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		return res.json({ id: this.lastID });
	});
});

//get detail
app.get('/events/:id/details', (req, res) => {
	const eventId = req.params.id;

	db.get('SELECT * FROM event_details WHERE event_id = ?', [eventId], (err, row) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		if (!row) {
			return res.status(404).json({ error: 'Event details not found' });
		}

		return res.json(row);
	});
});

//add detail to events
app.post('/events/:id/details', (req, res) => {
	const eventId = req.params.id;
	const { aboutText, notifications, feedback, photos, schedule } = req.body;

	// Check if the event with the given ID exists
	db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, eventRow) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		if (!eventRow) {
			return res.status(404).json({ error: 'Event not found' });
		}

		// Insert or update data in the event_details table
		db.run(`
			INSERT OR REPLACE INTO event_details (event_id, aboutText, notifications, feedback, photos, schedule)
			VALUES (?, ?, ?, ?, ?, ?)`, 
			[eventId, aboutText, JSON.stringify(notifications), JSON.stringify(feedback), JSON.stringify(photos), JSON.stringify(schedule)], function (err) {
			
			if (err) {
				return res.status(500).json({ error: err.message });
			}

			return res.json({ id: this.lastID });
		});
	});
});

app.delete('/events/:id', (req, res) => {
	const eventId = req.params.id;

	db.run('DELETE FROM events WHERE id = ?', [eventId], function (err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
	});

	db.run('DELETE FROM event_details WHERE event_id = ?', [eventId], function (err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		return res.json({ message: 'Event and detail deleted successfully' });
	});
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
