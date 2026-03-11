const express = require("express");
const http    = require("http");
const path    = require("path");
const crypto  = require("crypto");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "frontend")));

// ── State ──────────────────────────────────────────
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

let sessionToken     = null;
let sessionActive    = false;
let nowServing       = "None";
let servingStartTime = null;   // ISO timestamp when current user started being served
let waiting          = [];
let completed        = [];
let absent           = [];

function broadcast() {
  io.emit("queueUpdate", { nowServing, servingStartTime, waiting, completed, absent });
}

function broadcastSession() {
  io.emit("sessionStatus", { active: sessionActive, token: sessionToken });
}

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function serveNext() {
  const next = waiting.shift() || "None";
  nowServing       = next;
  servingStartTime = next !== "None" ? new Date().toISOString() : null;
}

// ── Socket events ────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("queueUpdate", { nowServing, servingStartTime, waiting, completed, absent });
  socket.emit("sessionStatus", { active: sessionActive, token: sessionToken });

  // ── Admin login ──
  // FIX: Only generate new token + reset queue if NO active session exists.
  // If a session is already running, just re-auth the admin without touching the queue.
  socket.on("adminLogin", ({ username, password }) => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {

      if (!sessionActive) {
        // Fresh login — start new session and reset queue
        sessionToken     = generateToken();
        sessionActive    = true;
        nowServing       = "None";
        servingStartTime = null;
        waiting          = [];
        completed        = [];
        absent           = [];
        console.log(`\n✅ Admin logged in (new session)`);
        console.log(`🔑 Token: ${sessionToken}`);
        console.log(`📷 QR: http://localhost:5000/login.html?token=${sessionToken}\n`);
        broadcast();
        broadcastSession();
      } else {
        // Session already active — just re-auth, keep queue intact
        console.log(`\n🔁 Admin re-authenticated (session still active)\n`);
      }

      socket.emit("adminAuth", { ok: true, token: sessionToken });

    } else {
      socket.emit("adminAuth", { ok: false, token: null });
    }
  });

  // ── Terminate session (only explicit button click) ──
  socket.on("terminateSession", () => {
    sessionActive    = false;
    sessionToken     = null;
    nowServing       = "None";
    servingStartTime = null;
    waiting          = [];
    completed        = [];
    absent           = [];
    console.log("\n🔴 Session terminated by admin\n");
    broadcast();
    broadcastSession();
  });

  // ── Validate token ──
  socket.on("validateToken", (token) => {
    const valid = sessionActive && token && token === sessionToken;
    socket.emit("tokenValid", valid);
  });

  // ── Get current session token (for skip flow) ──
  socket.on("getSessionToken", () => {
    socket.emit("sessionToken", sessionActive ? sessionToken : null);
  });

  // ── Add user ──
  socket.on("addUser", ({ userData, token }) => {
    if (!sessionActive || !token || token !== sessionToken) {
      socket.emit("joinRejected", "This queue session has ended or the QR code is invalid.");
      return;
    }

    if (nowServing === "None") {
      nowServing       = userData;
      servingStartTime = new Date().toISOString();
    } else {
      waiting.push(userData);
    }
    broadcast();
    socket.emit("joinSuccess");
  });

  // ── Mark completed ──
  socket.on("markCompleted", () => {
    if (nowServing === "None") return;
    completed.push(nowServing);
    serveNext();
    broadcast();
  });

  // ── Mark absent ──
  socket.on("markAbsent", () => {
    if (nowServing === "None") return;
    absent.push(nowServing);
    serveNext();
    broadcast();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SmartQueue running at http://localhost:${PORT}`);
  console.log(`   Admin: ${ADMIN_USER} / ${ADMIN_PASS}\n`);
});
