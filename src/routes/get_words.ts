import { Hono } from "hono";
import { WordModel } from "../models/word_model.js";

const app = new Hono();

//* INTRODUCTION
app.get("/", (c) => {
  return c.text("Word Retrieval API");
});

//* GET ALL WORDS
app.get("/all", async (c) => {
  try {
    const words = await WordModel.find({}).sort({ word: 1 });

    return c.json({
      success: true,
      count: words.length,
      data: words,
    });
  } catch (error: any) {
    console.error("Error fetching words:", error);
    return c.json(
      {
        success: false,
        message: "Error retrieving words",
        error: error.message,
      },
      500
    );
  }
});

//* GET WORDS STARTING WITH A LETTER
app.get("/alphabet/:letter", async (c) => {
  try {
    const { letter } = c.req.param();

    if (!letter || letter.length !== 1 || !/^[a-zA-Z]$/.test(letter)) {
      return c.json(
        {
          success: false,
          message: "Please provide a single letter (a-z, A-Z)",
        },
        400
      );
    }

    const regex = new RegExp(`^${letter}`, "i");
    const words = await WordModel.find({ word: { $regex: regex } }).sort({
      word: 1,
    });

    return c.json({
      success: true,
      count: words.length,
      data: words,
    });
  } catch (error: any) {
    console.error(
      `Error fetching words starting with ${c.req.param("letter")}:`,
      error
    );
    return c.json(
      {
        success: false,
        message: "Error retrieving words",
        error: error.message,
      },
      500
    );
  }
});

//* SEARCH WORDS
app.get("/search/:term", async (c) => {
  try {
    const { term } = c.req.param();
    const { position = "any" } = c.req.query();

    if (!term) {
      return c.json(
        {
          success: false,
          message: "Search term is required",
        },
        400
      );
    }

    let regex;
    switch (position.toLowerCase()) {
      case "start":
        regex = new RegExp(`^${term}`, "i");
        break;
      case "end":
        regex = new RegExp(`${term}$`, "i");
        break;
      case "any":
      default:
        regex = new RegExp(term, "i");
    }

    const words = await WordModel.find({
      $or: [{ word: { $regex: regex } }, { definition: { $regex: regex } }],
    }).sort({ word: 1 });

    return c.json({
      success: true,
      count: words.length,
      search: {
        term,
        position,
      },
      data: words,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return c.json(
      {
        success: false,
        message: "Error performing search",
        error: error.message,
      },
      500
    );
  }
});

//* GET WORDS BY USERNAME
app.get("/user/:username", async (c) => {
  try {
    const { username } = c.req.param();

    if (!username) {
      return c.json(
        {
          success: false,
          message: "Username is required",
        },
        400
      );
    }

    const words = await WordModel.find({
      username: username.toLowerCase().trim(),
    }).sort({ word: 1 });

    return c.json({
      success: true,
      count: words.length,
      username: username.toLowerCase().trim(),
      data: words,
    });
  } catch (error: any) {
    console.error(
      `Error fetching words for user ${c.req.param("username")}:`,
      error
    );
    return c.json(
      {
        success: false,
        message: "Error retrieving user's words",
        error: error.message,
      },
      500
    );
  }
});

export default app;
