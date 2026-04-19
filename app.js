const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

let db;

// ✅ Create connection pool (IMPORTANT)
function createPool() {
  return mysql.createPool({
    host: "db",
    user: "root",
    password: "21-Feb-05",
    database: "testdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// ✅ Wait until DB is ready
function connectWithRetry() {
  db = createPool();

  db.getConnection((err, connection) => {
    if (err) {
      console.log("⏳ Waiting for MySQL...");
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("✅ Connected to MySQL");
      connection.release();

      // 🚀 Start server ONLY after DB is ready
      app.listen(3000, () =>
        console.log("🚀 Server running on port 3000")
      );
    }
  });
}

connectWithRetry();


// ================= ROUTES ================= //

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

  db.query(
    "SELECT * FROM users WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send(result);
    }
  );
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

// ✅ Metrics for Prometheus
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send("app_up 1\n");
});
