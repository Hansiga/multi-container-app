const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

// Create MySQL connection pool
const db = mysql.createPool({
  host: "db",
  user: "root",
  password: "21-Feb-05",
  database: "testdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB connection repeatedly until success
function checkDBConnection() {
  db.getConnection((err, connection) => {
    if (err) {
      console.log("Waiting for MySQL...");
      setTimeout(checkDBConnection, 5000);
    } else {
      console.log("Connected to DB");
      connection.release();
    }
  });
}

checkDBConnection();

// CREATE
app.post("/add", (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO users (name) VALUES (?)", [name], (err) => {
    if (err) return res.status(500).send(err);
    res.send("User Added");
  });
});

// READ
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));