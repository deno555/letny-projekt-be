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
				test TEXT,
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

app.post('/events/:id/details/aboutText', (req, res) => {
    const eventId = req.params.id;
    const aboutText = req.body.aboutText;
    
    db.get('SELECT aboutText form event_details where event_id = ?', [eventId], function(row){
        if (row) {
            db.run('UPDATE event_details SET aboutText = ? WHERE event_id = ?', [aboutText, eventId], function(err) {
                if (err) {
                    console.error('Error updating aboutText:', err);
                } else {
                    console.log('aboutText updated successfully.');
                }
            });
        } else {
            // If no row exists, insert a new row with the aboutText
            db.run('INSERT INTO event_details (event_id, aboutText) VALUES (?, ?)', [eventId, aboutText], function(err) {
                if (err) {
                    console.error('Error inserting aboutText:', err);
                } else {
                    console.log('New aboutText inserted successfully.');
                }
            });
        }
    })

    db.run('UPDATE event_details SET aboutText = ? WHERE event_id = ?', [aboutText, eventId], function(err) {
        if (err) {
			console.log(err)
            return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'About text added successfully' });
    });
});

app.post('/events/:id/details/notifs', (req, res) => {
	const eventId = req.params.id;
    const notification = req.body.notifications;

    db.get('SELECT notifications FROM event_details WHERE event_id = ?', [eventId], function(err, row) {
        let notifications;

        if (row && row.notifications) {
            notifications = JSON.parse(row.notifications);
        } else {
            notifications = [];
        }

        notifications.push(notification); // Add the new notifications object to the array

        let notificationsString = JSON.stringify(notifications); // Convert the array back to a string

        if (row) {
            db.run('UPDATE event_details SET notifications = ? WHERE event_id = ?', [notificationsString, eventId], function(err) {
                if (err) {
                    console.error('Error updating notifications:', err);
                } else {
                    console.log('notifications updated successfully.');
                }
            });
        } else {
            // If no row exists, insert a new row with the notifications
            db.run('INSERT INTO event_details (event_id, notifications) VALUES (?, ?)', [eventId, notificationsString], function(err) {
                if (err) {
                    console.error('Error inserting notifications:', err);
                } else {
                    console.log('New notifications inserted successfully.');
                }
            });
        }
    });
});

app.post('/events/:id/details/feedback', (req, res) => {
    const eventId = req.params.id;
    const feedback = req.body.feedback;

    db.get('SELECT feedback FROM event_details WHERE event_id = ?', [eventId], function(err, row) {
        let feedbacks;

        if (row && row.feedback) {
            feedbacks = JSON.parse(row.feedback);
        } else {
            feedbacks = [];
        }

        feedbacks.push(feedback); // Add the new feedback object to the array

        let feedbackString = JSON.stringify(feedbacks); // Convert the array back to a string

        if (row) {
            db.run('UPDATE event_details SET feedback = ? WHERE event_id = ?', [feedbackString, eventId], function(err) {
                if (err) {
                    console.error('Error updating feedback:', err);
                } else {
                    console.log('Feedback updated successfully.');
                }
            });
        } else {
            // If no row exists, insert a new row with the feedback
            db.run('INSERT INTO event_details (event_id, feedback) VALUES (?, ?)', [eventId, feedbackString], function(err) {
                if (err) {
                    console.error('Error inserting feedback:', err);
                } else {
                    console.log('New feedback inserted successfully.');
                }
            });
        }
    });
});

app.post('/events/:id/details/photo', (req, res) => {
	const eventId = req.params.id;
    const photo = req.body.photo;

    db.get('SELECT photos FROM event_details WHERE event_id = ?', [eventId], function(err, row) {
        let photos;

        if (row && row.photos) {
            photos = JSON.parse(row.photos);
        } else {
            photos = [];
        }

        photos.push(photo); // Add the new photos object to the array

        let scheduleString = JSON.stringify(photos); // Convert the array back to a string

        if (row) {
            db.run('UPDATE event_details SET photos = ? WHERE event_id = ?', [scheduleString, eventId], function(err) {
                if (err) {
                    console.error('Error updating photos:', err);
                } else {
                    console.log('photos updated successfully.');
                }
            });
        } else {
            // If no row exists, insert a new row with the photos
            db.run('INSERT INTO event_details (event_id, photos) VALUES (?, ?)', [eventId, scheduleString], function(err) {
                if (err) {
                    console.error('Error inserting photos:', err);
                } else {
                    console.log('New photos inserted successfully.');
                }
            });
        }
    });
});

app.post('/events/:id/details/schedule', (req, res) => {
    const eventId = req.params.id;
    const schedule = req.body.schedule;

    db.get('SELECT schedule FROM event_details WHERE event_id = ?', [eventId], function(err, row) {
        let schedules;

        if (row && row.schedule) {
            schedules = JSON.parse(row.schedule);
        } else {
            schedules = [];
        }

        schedules.push(schedule); // Add the new schedule object to the array

        let scheduleString = JSON.stringify(schedules); // Convert the array back to a string

        if (row) {
            db.run('UPDATE event_details SET schedule = ? WHERE event_id = ?', [scheduleString, eventId], function(err) {
                if (err) {
                    console.error('Error updating schedule:', err);
                } else {
                    console.log('Schedule updated successfully.');
                }
            });
        } else {
            // If no row exists, insert a new row with the schedule
            db.run('INSERT INTO event_details (event_id, schedule) VALUES (?, ?)', [eventId, scheduleString], function(err) {
                if (err) {
                    console.error('Error inserting schedule:', err);
                } else {
                    console.log('New schedule inserted successfully.');
                }
            });
        }
    });
});

app.post('/test', () => {
	const eventId = 1;
	const test = { name: 'test'};

	db.get('SELECT test FROM event_details WHERE event_id = ?', [eventId], function(err, row) {
        let tests = row ? JSON.parse(row.test) : []; // Parse test column as JSON array

        tests.push(test); // Add the new test object to the array

        let testString = JSON.stringify(tests); // Convert the array back to a string

        if (row) {
            db.run('UPDATE event_details SET test = ? WHERE event_id = ?', [testString, eventId], function(err) {
                if (err) {
                    console.error('Error updating test:', err);
                } else {
                    console.log('Test updated successfully.');
                }
            });
        } else {
            db.run('INSERT INTO event_details (event_id, test) VALUES (?, ?)', [eventId, testString], function(err) {
                if (err) {
                    console.error('Error inserting test:', err);
                } else {
                    console.log('New test inserted successfully.');
                }
            });
        }
	})
})

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
