const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./coffee.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create coffee table first
db.run(`
    CREATE TABLE IF NOT EXISTS coffees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        votes INTEGER DEFAULT 0
    )
`, (err) => {
    if (err) {
        console.error("Table creation failed:", err.message);
        return;
    }

    console.log("Coffee table ready.");

    // Add sample coffees only after table is ready
    db.get("SELECT COUNT(*) AS count FROM coffees", (err, row) => {
        if (err) {
            console.error("Checking coffees failed:", err.message);
            return;
        }

        if (row.count === 0) {
            const coffees = [
                "Cappuccino",
                "Latte",
                "Espresso",
                "Americano",
                "Mocha"
            ];

            const stmt = db.prepare(
                "INSERT INTO coffees (name, votes) VALUES (?, ?)"
            );

            coffees.forEach((coffee) => {
                stmt.run(coffee, 0);
            });

            stmt.finalize(() => {
                console.log("Sample coffees added.");
            });
        } else {
            console.log("Coffee data already exists.");
        }
    });
});

module.exports = db;