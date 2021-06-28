const express = require("express");
const postController = require("./../controllers/postController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router
  .route("/togglelikepost")
  .post(authController.protect, postController.likePost);
router
  .route("/postcomment")
  .post(authController.protect, postController.postComment);
router
  .route("/sharepost")
  .post(authController.protect, postController.sharepost);

router
  .route("/:id")
  .get(authController.protect, postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

module.exports = router;
