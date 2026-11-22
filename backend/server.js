require("dotenv").config();

const propertiesRouter = require("./routes/properties");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Server logs go straight to stdout, one line per entry, so the codebase
// has no leftover debug logging calls.
function writeLog(message) {
    process.stdout.write(`${message}\n`);
}

// Request logger: method, URL, time, status and response time in ms.
// process.hrtime.bigint() is a monotonic high-resolution clock, so the
// duration is accurate to fractions of a millisecond.
function requestLogger(req, res, next) {
    const start = process.hrtime.bigint();
    const timestamp = new Date().toISOString();

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

        writeLog(
            `${req.method} ${req.originalUrl} | ${timestamp} | Status: ${res.statusCode} | ${durationMs.toFixed(2)}ms`
        );
    });

    next();
}

app.use(requestLogger);

app.use("/api/properties", propertiesRouter);

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

// Only start listening when run directly (npm run dev / node server.js),
// so tests can import the app without opening a port.
if (require.main === module) {
    app.listen(PORT, () => {
        writeLog(`Server running on port ${PORT}`);
    });
}

module.exports = app;
module.exports.requestLogger = requestLogger;