const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql123',
  database: 'Tickets'
});

db.connect(err => err ? console.error(err) : console.log('MySQL Connected'));


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));


app.post('/create', (req, res) => {
  const { title, description } = req.body;
  db.query('INSERT INTO tickets (title, description) VALUES (?, ?)', [title, description], err => {
    if (err) throw err;
    res.redirect('/tickets');
  });
});


app.get('/tickets', (req, res) => {
  db.query('SELECT * FROM tickets', (err, results) => {
    if (err) throw err;
    const tickets = results.map(ticket => `
      <li>
        <strong>${ticket.title}</strong>: ${ticket.description}
        <a href="/edit/${ticket.id}">Edit</a>
        <a href="/delete/${ticket.id}">Delete</a>
      </li>
    `).join('');
    res.send(`<h1>Tickets</h1><ul>${tickets}</ul><a href="/">Create New Ticket</a>`);
  });
});


app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tickets WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    const ticket = results[0];
    res.send(`
      <h1>Edit Ticket</h1>
      <form action="/update/${id}" method="POST">
        <input type="text" name="title" value="${ticket.title}" required>
        <textarea name="description" required>${ticket.description}</textarea>
        <button type="submit">Update Ticket</button>
      </form>
      <a href="/tickets">Cancel</a>
    `);
  });
});


app.post('/update/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  db.query('UPDATE tickets SET title = ?, description = ? WHERE id = ?', [title, description, id], err => {
    if (err) throw err;
    res.redirect('/tickets');
  });
});


app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tickets WHERE id = ?', [id], err => {
    if (err) throw err;
    res.redirect('/tickets');
  });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
