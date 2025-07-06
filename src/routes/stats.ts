import { Hono } from "hono";
import { WordModel } from "../models/word_model.js";
import { UserModel } from "../models/user_model.js";
import { BookmarkModel } from "../models/bookmark_model.js";

const app = new Hono();

//* INTRODUCTION
app.get("/", (c) => {
  return c.text("Stats API");
});

//* GET STATS
app.get("/all", async (c) => {
  try {
    // Get a random word
    const randomWord = await WordModel.aggregate([{ $sample: { size: 1 } }]);
    
    // Get total word count
    const wordCount = await WordModel.countDocuments();
    
    // Get total user count
    const userCount = await UserModel.countDocuments();
    
    // Get total bookmark count
    const bookmarkCount = await BookmarkModel.countDocuments();

    return c.json({
      success: true,
      data: {
        randomWord: randomWord.length > 0 ? randomWord[0] : null,
        stats: {
          totalWords: wordCount,
          totalUsers: userCount,
          totalBookmarks: bookmarkCount
        }
      }
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return c.json(
      {
        success: false,
        message: "Error retrieving statistics",
        error: error.message,
      },
      500
    );
  }
});

export default app;