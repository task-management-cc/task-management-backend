require('dotenv').config();

const express = require('express');
const pool = require('./dbconfig');
const app = express();
const port = 4000;

app.use(express.json());

app.post('/tasks', async (req, res) => {
  try {
    console.log(req.body);
    const { title, description, progress, status, due_date, email } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, description, progress, status, due_date, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, progress, status, due_date, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const { email } = req.body;
    const tasks = await pool.query('SELECT * FROM tasks WHERE email = $1', [email]);
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, progress, status, due_date, email } = req.body;
      const result = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, progress = $3, status = $4, due_date = $5, email = $6 WHERE task_id = $7 RETURNING *',
        [title, description, progress, status, due_date, email, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Task not found');
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM tasks WHERE task_id = $1', [id]);
        res.json('Task was deleted!');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});