const express = require("express");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home page
app.get("/", (req, res) => {
    db.all("SELECT * FROM coffees ORDER BY votes DESC", [], (err, coffees) => {
        if (err) {
            return res.status(500).send("Database error");
        }

        const coffeeCards = coffees.map(coffee => `
            <div class="coffee-card">
                <div class="coffee-icon">☕</div>
                <h2>${coffee.name}</h2>
                <p>Votes: <strong>${coffee.votes}</strong></p>

                <button onclick="vote(${coffee.id})">
                    Vote
                </button>
            </div>
        `).join("");

        const leaderboard = coffees
            .slice()
            .sort((a, b) => b.votes - a.votes)
            .map((coffee, index) => `
                <li>
                    <span>${index + 1}. ${coffee.name}</span>
                    <strong>${coffee.votes} votes</strong>
                </li>
            `).join("");

        res.send(`
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <title>Coffee Rating App</title>

                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background: #f5f1eb;
                        color: #333;
                        padding: 30px;
                    }

                    .container {
                        max-width: 1000px;
                        margin: auto;
                    }

                    h1 {
                        text-align: center;
                        margin-bottom: 10px;
                    }

                    .subtitle {
                        text-align: center;
                        color: #666;
                        margin-bottom: 35px;
                    }

                    .coffee-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap: 20px;
                    }

                    .coffee-card {
                        background: white;
                        padding: 25px;
                        border-radius: 15px;
                        text-align: center;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }

                    .coffee-icon {
                        font-size: 45px;
                    }

                    .coffee-card h2 {
                        margin: 15px 0 8px;
                    }

                    .coffee-card p {
                        color: #666;
                    }

                    button {
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        background: #333;
                        color: white;
                        cursor: pointer;
                        font-size: 15px;
                    }

                    button:hover {
                        background: #555;
                    }

                    .leaderboard {
                        background: white;
                        margin-top: 40px;
                        padding: 25px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }

                    .leaderboard h2 {
                        text-align: center;
                    }

                    .leaderboard ol {
                        padding-left: 25px;
                    }

                    .leaderboard li {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px;
                        border-bottom: 1px solid #eee;
                    }
                </style>
            </head>

            <body>

                <div class="container">

                    <h1>☕ Coffee Rating Application</h1>

                    <p class="subtitle">
                        Vote for your favourite coffee!
                    </p>

                    <div class="coffee-grid">
                        ${coffeeCards}
                    </div>

                    <div class="leaderboard">
                        <h2>🏆 Top Rated Coffee</h2>

                        <ol>
                            ${leaderboard}
                        </ol>
                    </div>

                </div>

                <script>
                    async function vote(coffeeId) {
                        const response = await fetch("/vote", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                id: coffeeId
                            })
                        });

                        if (response.ok) {
                            window.location.reload();
                        }
                    }
                </script>

            </body>
            </html>
        `);
    });
});

// POST endpoint for voting
app.post("/vote", (req, res) => {
    const { id } = req.body;

    db.run(
        "UPDATE coffees SET votes = votes + 1 WHERE id = ?",
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({
                    error: "Vote failed"
                });
            }

            res.json({
                success: true,
                message: "Vote added"
            });
        }
    );
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Coffee Rating App running at http://localhost:${PORT}`);
});