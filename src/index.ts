import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import mongoose from "mongoose";
import { config } from "dotenv";
config();
// require("dotenv").config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI!;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    dbName: "buzzwords",
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// APP
const app = new Hono();
app.use("*", cors());

// INTRODUCTION
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// ROUTES
import auth from "./routes/auth.ts";
import submitWord from "./routes/submit_word.ts";
import getWords from "./routes/get_words.ts";
import bookmarks from "./routes/bookmarks.ts";
import stats from "./routes/stats.ts";

// ENDPOINTS
app.route("/auth", auth); // auth
app.route("/submitWord", submitWord); // word submission
app.route("/getWords", getWords); // word retrieval
app.route("/bookmarks", bookmarks); // bookmarks management
app.route("/stats", stats); // statistics

// ERROR HANDLING
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json(err.message);
});

// PORT
var port = Number.parseInt(process.env.PORT!) || 3000;

// SERVE
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default app;
