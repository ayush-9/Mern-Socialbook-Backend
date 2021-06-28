const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.route("/").get(authController.protect, userController.getAllUsers);
router.route("/search").get(authController.protect, userController.searchUsers);
router
  .route("/friendrequests")
  .get(authController.protect, userController.friendrequests);
router.route("/:id").get(authController.protect, userController.getUser);
router
  .route("/sendfriendrequest")
  .post(authController.protect, userController.sendfriendrequest);

router
  .route("/acceptfriendrequest")
  .post(authController.protect, userController.acceptfriendrequest);

module.exports = router;
