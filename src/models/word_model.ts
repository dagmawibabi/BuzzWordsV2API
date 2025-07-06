import mongoose, { Document, Schema } from "mongoose";

export interface IWord extends Document {
  word: string;
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  antonyms: string[];
  username: string;  // Store username directly
  createdAt: Date;
  updatedAt: Date;
}

const wordSchema = new Schema<IWord>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      lowercase: true
    },
    word: {
      type: String,
      required: [true, "Word is required"],
      trim: true,
      lowercase: true,
    },
    definition: {
      type: String,
      required: [true, "Definition is required"],
      trim: true,
    },
    partOfSpeech: {
      type: String,
      required: [true, "Part of speech is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: [
          "noun",
          "verb",
          "adjective",
          "adverb",
          "pronoun",
          "preposition",
          "conjunction",
          "interjection",
        ],
        message: "{VALUE} is not a valid part of speech",
      },
    },
    synonyms: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    antonyms: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add a compound index to ensure word and part of speech combination is unique per user
wordSchema.index({ word: 1, partOfSpeech: 1, username: 1 }, { unique: true });

export const WordModel = mongoose.model<IWord>("Word", wordSchema);
