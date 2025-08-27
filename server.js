const con = require('./database');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//============================ Common routes ============================
const jwt = require('jsonwebtoken');

// ===== Middleware check JWT =====
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).send("Missing or invalid Authorization header.");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub ?? payload.user_id ?? payload.id;
    if (!userId) {
      return res.status(401).send("Invalid token payload.");
    }
    req.user = { id: userId };
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token.");
  }
}

// ===== add-expense =====
app.post('/add-expense', (req, res) => {
    const { user_id, item, paid } = req.body;
    if (!user_id || !item || !paid) {
        return res.status(400).send("Missing required fields: user_id, item, or paid.");
    }

    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (result.affectedRows === 1) {
            return res.status(200).send("Expense added successfully.");
        } else {
            return res.status(500).send("Failed to add expense.");
        }
    });
});

// ===== delete-expense =====
app.delete('/delete-expense/:id', requireAuth, (req, res) => {
    const expenseId = req.params.id;
    if (!expenseId) {
        return res.status(400).send("Missing expense ID.");
    }

    // Bind the deletion to user_id from the token.
    const sql = "DELETE FROM expense WHERE id = ? AND user_id = ?";
    con.query(sql, [expenseId, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (result.affectedRows === 1) {
            return res.status(200).send("Expense deleted successfully.");
        } else {
            return res.status(404).send("Expense not found or not owned by this user.");
        }
    });
});

//============================ Server starts here ============================
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});