import mongoose, { Document, Schema } from "mongoose";

export interface IBookmark extends Document {
  wordId: mongoose.Types.ObjectId;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    wordId: {
      type: Schema.Types.ObjectId,
      ref: 'Word',
      required: [true, 'Word ID is required'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      lowercase: true,
      index: true, // For faster lookups by username
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can't bookmark the same word multiple times
bookmarkSchema.index({ wordId: 1, username: 1 }, { unique: true });

export const BookmarkModel = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
