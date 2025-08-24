const con = require('./database');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//============================ Common routes ============================
// get all expenses of user
app.get('/expenses/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM expense WHERE user_id = ?";
    con.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).send("Database server error");
        }
        return res.json(results);
    });
});

// get today's expenses of user
app.get('/expenses/today/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT * FROM expense
        WHERE user_id = ?
        AND DATE(date) = CURDATE()
    `;
    con.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).send("Database server error");
        }
        return res.json(results);
    });
});


//============================ Server starts here ============================
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});