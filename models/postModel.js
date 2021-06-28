const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A post must have a name"],
    trim: true,
    maxlength: [40, "A post name must have less or equal then 40 characters"],
    minlength: [3, "A post name must have more or equal then 10 characters"],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  status: {
    type: String,
    required: [true, "A post must have a status"],
    enum: {
      values: ["pending", "progress", "done"],
      message: "Post status is either: pending, progress, done",
    },
  },
  description: {
    type: String,
    trim: true,
    required: [true, "A post must have a description"],
    minlength: [
      10,
      "A post description must have more or equal then 10 characters",
    ],
  },
  image: {
    type: String,
  },
  userId: {
    type: String,
    immutable: true,
  },
  user: { name: String, photo: String, email: String },
  likers: [],
  commenters: [],
  sharers: [],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
