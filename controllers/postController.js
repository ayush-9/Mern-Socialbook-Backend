const Post = require("./../models/postModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const arrfun = require("./../utils/arr");
const AppError = require("./../utils/appError");
const mongoose = require("mongoose");
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const arr = arrfun(req);
  const features = new APIFeatures(
    Post.find({ userId: { $in: [...arr, req.user._id] } }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const posts = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
  // Post.findOne({ _id: req.params.id })

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    ...req.body,
    userId: req.user._id,
    user: { name: req.user.name, photo: req.user.photo, email: req.user.email },
  });

  res.status(201).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { post },
  });
});

//

//

//

//

//

//

//

//

//

//

//

//

//

//

//like & comment
exports.likePost = catchAsync(async (req, res, next) => {
  const arr = arrfun(req);

  let post = await Post.findOne({
    _id: req.body.id,
    userId: { $in: [...arr, req.user._id] },
  });
  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }
  let isliked = false;
  for (let i = 0; i < post.likers.length; i++) {
    var liker = post.likers[i];
    if (liker._id.toString() === req.user._id.toString()) {
      isliked = true;
      break;
    }
  }
  if (isliked) {
    await Post.updateOne(
      { _id: req.body.id },
      {
        $pull: {
          likers: { _id: req.user._id },
        },
      }
    );
  } else {
    await Post.updateOne(
      { _id: req.body.id },
      {
        $push: {
          likers: { _id: req.user._id },
        },
      }
    );
  }
  post = await Post.findOne({
    _id: req.body.id,
    userId: { $in: [...arr, req.user._id] },
  });
  res.status(201).json({
    status: "success",
    message: `Post liked by me: ${!isliked}`,
    data: { post },
  });
});

exports.postComment = catchAsync(async (req, res, next) => {
  const arr = arrfun(req);

  let post = await Post.findOne({
    _id: req.body.id,
    userId: { $in: [...arr, req.user._id] },
  });
  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }
  if (!req.body.comment || req.body.comment == "") {
    return next(new AppError("No Comment written", 404));
  }
  let commentId = mongoose.Types.ObjectId();

  await Post.updateOne(
    { _id: req.body.id },
    {
      $push: {
        commenters: {
          _id: commentId,
          user: {
            _id: req.user._id,
            name: req.user.name,
            photo: req.user.photo || "default",
          },
          comment: req.body.comment,
          createdAt: new Date().getTime(),
        },
      },
    }
  );
  post = await Post.findOne({
    _id: req.body.id,
    userId: { $in: [...arr, req.user._id] },
  });
  res.status(201).json({
    status: "success",
    data: { post },
  });
});

exports.sharepost = catchAsync(async (req, res, next) => {
  const arr = arrfun(req);

  let post = await Post.findOne({
    _id: req.body.id,
    userId: { $in: [...arr] },
  });
  if (!post) {
    return next(new AppError("You cannot share your own post", 404));
  }

  await Post.updateOne(
    { _id: req.body.id },
    {
      $push: {
        sharers: {
          user: {
            _id: req.user._id,
            name: req.user.name,
            photo: req.user.photo || "default",
          },
        },
      },
    }
  );
  const sharedpost = await Post.create({
    name: post.name,
    status: post.status,
    description: post.description,
    userId: req.user._id,
    user: {
      name: req.user.name,
      email: req.user.email,
      photo: req.user.photo,
    },
    createdAt: new Date(),
    image: post.image,
    likers: [],
    commenters: [],
    sharers: [],
  });
  post = await Post.findOne({
    _id: req.body.id,
  });
  res.status(201).json({
    status: "success",
    sharedpost,
    post,
    message: "Post has been shared",
  });
});
