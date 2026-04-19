const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "21-Feb-05",
  database: "testdb"
});

// Retry connection (your logic kept)
function connectDB() {
  db.connect((err) => {
    if (err) {
      console.log("Waiting for MySQL...");
      setTimeout(connectDB, 5000);
    } else {
      console.log("Connected to DB");
    }
  });
}
connectDB();




app.post("/add", (req, res) => {
  const { name } = req.body;
  db.query(
    "INSERT INTO users (name) VALUES (?)",
    [name],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "User Added", id: result.insertId });
    }
  );
});


app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});


app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});


app.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  db.query(
    "UPDATE users SET name = ? WHERE id = ?",
    [name, id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "User Updated" });
    }
  );
});


app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM users WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "User Deleted" });
    }
  );
});



app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send("app_up 1\n");
});



app.listen(3000, () => console.log("Server running on port 3000"));
