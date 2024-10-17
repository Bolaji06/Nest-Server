import "dotenv/config";

import auth from "./routes/auth.js";
import user from "./routes/user.js";
import post from "./routes/post.js";
import chat from "./routes/chat.js";
import message from "./routes/message.js";
import save from "./routes/save_post.js";
import email from "./routes/email.js";

import express from "express";
import timeout from "connect-timeout";
import cors from "cors";
import http from "http";

import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import prisma from "./lib/prisma.js";
import { parse } from "path";
import { stat } from "fs";
import { error } from "console";
import { findOrCreateChat } from "./utils/chat.js";

const PORT = 7000;
const app = express();
const allowedOrigins = [
  process.env.DEV_CORS_URL,
  process.env.PROD_CORS_URL,
  process.env.PROD_SERVER_URL,
];

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

//app.use(timeout("10s"));
app.use(cookieParser(process.env.TOKEN_SECRET));
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/post", post);
app.use("/api/chat", chat);
app.use("/api/message", message);
app.use("/api/save-post", save);
app.use("/email", email);

let userId;
app.get("/", (req, res) => {
  res.send("Welcome to the homepage");
});

//create a websocket connection
wss.on("connection", (ws) => {
  console.log("connected...");

  // receive message from the client
  ws.on("message", async (message) => {
    const parseMessage = JSON.parse(message.toString());

    const { userId, receiverId, text } = parseMessage;
    const newMessage = await findOrCreateChat(userId, receiverId, text);

    // send message to the client
    ws.send(JSON.stringify(newMessage));
  });
});

function haltRequestOnTimeout(req, res, next) {
  if (!req.timedout) return next();
  else {
    return res.status(503).send("Request timeout");
  }
}

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  next();
  return res.status(503).json({ success: false, message: "request timeout" });
  //.send("An unexpected error occurred. Please try again later.");
});

server.listen(PORT, () => {
  console.log("Server starting at " + PORT);
});

//server.timeout = 15000;
