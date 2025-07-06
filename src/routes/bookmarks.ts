import { Hono } from "hono";
import { BookmarkModel } from "../models/bookmark_model.js";
import { WordModel } from "../models/word_model.js";

const app = new Hono();

//* INTRODUCTION
app.get("/", (c) => {
  return c.text("Bookmarks API");
});

//* ADD BOOKMARK
app.post("/add", async (c) => {
  try {
    const { wordId, username } = await c.req.json();

    // Validate required fields
    if (!wordId || !username) {
      return c.json(
        {
          success: false,
          message: "Word ID and username are required",
        },
        400
      );
    }

    // Check if the word exists
    const word = await WordModel.findById(wordId);
    if (!word) {
      return c.json(
        {
          success: false,
          message: "Word not found",
        },
        404
      );
    }

    // Create new bookmark
    const newBookmark = new BookmarkModel({
      wordId,
      username: username.toLowerCase().trim(),
    });

    // Save bookmark to database
    const savedBookmark = await newBookmark.save();

    // Populate the word details
    await savedBookmark.populate("wordId");

    // Return success response
    return c.json({
      success: true,
      message: "Word bookmarked successfully",
      data: savedBookmark,
    });
  } catch (error: any) {
    console.error("Bookmark error:", error);

    // Handle duplicate key error (user trying to bookmark same word twice)
    if (error.code === 11000) {
      return c.json(
        {
          success: false,
          message: "This word is already bookmarked by the user",
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

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return c.json(
        {
          success: false,
          message: "Invalid word ID format",
        },
        400
      );
    }

    // Generic error response
    return c.json(
      {
        success: false,
        message: "Error bookmarking word",
        error: error.message,
      },
      500
    );
  }
});

//* GET USER'S BOOKMARKS
app.get("/user/:username", async (c) => {
  try {
    const { username } = c.req.param();
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;

    if (!username) {
      return c.json(
        {
          success: false,
          message: "Username is required",
        },
        400
      );
    }

    const [bookmarks, total] = await Promise.all([
      BookmarkModel.find({ username: username.toLowerCase().trim() })
        .populate("wordId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BookmarkModel.countDocuments({ username: username.toLowerCase().trim() }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return c.json({
      success: true,
      data: {
        bookmarks,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookmarks:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching bookmarks",
        error: error.message,
      },
      500
    );
  }
});

//* REMOVE BOOKMARK
app.delete("/remove/:bookmarkId", async (c) => {
  try {
    const { bookmarkId } = c.req.param();
    const { username } = await c.req.json();

    // Validate required fields
    if (!bookmarkId || !username) {
      return c.json(
        {
          success: false,
          message: "Bookmark ID and username are required",
        },
        400
      );
    }

    // Find and delete the bookmark
    const deletedBookmark = await BookmarkModel.findOneAndDelete({
      _id: bookmarkId,
      username: username.toLowerCase().trim(),
    });

    if (!deletedBookmark) {
      return c.json(
        {
          success: false,
          message: "Bookmark not found or you don't have permission to remove it",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Bookmark removed successfully",
      data: deletedBookmark,
    });
  } catch (error: any) {
    console.error("Error removing bookmark:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return c.json(
        {
          success: false,
          message: "Invalid bookmark ID format",
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        message: "Error removing bookmark",
        error: error.message,
      },
      500
    );
  }
});

export default app;
