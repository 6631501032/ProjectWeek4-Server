const con = require('./database');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//============================ Common routes ============================
// Implement addExpense(userid, item, paid)
app.post('/add-expense', (req, res) => {
    const { user_id, item, paid } = req.body;
    if (!user_id || !item || !paid) {
        return res.status(400).send("Missing required fields: user_id, item, or paid.");
    }

    // Insert new expense into the 'expense' table
    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        // Check if a row was inserted
        if (result.affectedRows === 1) {
            return res.status(200).send("Expense added successfully.");
        } else {
            return res.status(500).send("Failed to add expense.");
        }
    });
});

// Implement deleteExpense(expenseid)
app.delete('/delete-expense/:id', (req, res) => {
    const expenseId = req.params.id;
    // For security, you should also verify the user trying to delete it owns the expense.
    // However, based on the provided Dart code, we'll only use the expenseId for now.
    // A better implementation would pass the user_id in the body.
    // const { user_id } = req.body;
    
    if (!expenseId) {
        return res.status(400).send("Missing expense ID.");
    }
    
    // Delete the expense based on its ID
    const sql = "DELETE FROM expense WHERE id = ?";
    con.query(sql, [expenseId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        // Check if a row was actually deleted
        if (result.affectedRows === 1) {
            return res.status(200).send("Expense deleted successfully.");
        } else {
            return res.status(404).send("Expense not found or already deleted.");
        }
    });
});
//============================ Server starts here ============================
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});