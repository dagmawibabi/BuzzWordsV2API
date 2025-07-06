import { Hono } from "hono";
import { WordModel } from "../models/word_model.js";

const app = new Hono();

//* INTRODUCTION
app.get("/", (c) => {
  return c.text("Word Submission API");
});

//* SUBMIT WORD
app.post("/submit", async (c) => {
  try {
    const {
      word,
      definition,
      partOfSpeech,
      username,
      synonyms = [],
      antonyms = [],
    } = await c.req.json();

    // Validate required fields
    if (!word || !definition || !partOfSpeech || !username) {
      return c.json(
        {
          success: false,
          message: "Word, definition, part of speech, and username are required",
        },
        400
      );
    }

    // Create new word
    const newWord = new WordModel({
      word: word.toLowerCase().trim(),
      definition: definition.trim(),
      partOfSpeech: partOfSpeech.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      synonyms: Array.isArray(synonyms)
        ? synonyms.map((s: string) => s.toLowerCase().trim())
        : [],
      antonyms: Array.isArray(antonyms)
        ? antonyms.map((a: string) => a.toLowerCase().trim())
        : [],
    });

    // Save word to database
    const savedWord = await newWord.save();

    // Return success response
    return c.json({
      success: true,
      message: "Word submitted successfully",
      data: savedWord,
    });
  } catch (error: any) {
    console.error("Word submission error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return c.json(
        {
          success: false,
          message: "This word with the same part of speech already exists",
        },
        409
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: messages,
        },
        400
      );
    }

    // Generic error response
    return c.json(
      {
        success: false,
        message: "Error submitting word",
        error: error.message,
      },
      500
    );
  }
});

export default app;
