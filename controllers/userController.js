const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { startSession } = require("mongoose");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",

    data: {
      user,
    },
  });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  let users = await User.find({
    name: { $regex: new RegExp(req.query.search, "i") },
  });

  if (users.length >= 1) {
    users = users.filter((user) => user._id != req.user.id);
  }
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.sendfriendrequest = async (req, res) => {
  const session = await startSession();
  try {
    const user = await User.findOne({ _id: req.body.id });
    session.startTransaction();

    const receiver = await User.updateOne(
      {
        _id: user._id,
      },
      {
        $addToSet: {
          friends: {
            _id: req.user.id,
            name: req.user.name,
            status: "Pending",
            sendbyme: false,
            photo: req.user.photo || "default",
          },
        },
      },
      { session }
    );
    const sender = await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $addToSet: {
          friends: {
            _id: user._id,
            name: user.name,
            status: "Pending",
            sendbyme: true,
            photo: user.photo || "default",
          },
        },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      data: {
        message: "Friend request sent",
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.send(err);
  }
};

exports.acceptfriendrequest = async (req, res) => {
  const session = await startSession();
  try {
    session.startTransaction();

    const otheruser = await User.updateOne(
      {
        $and: [{ _id: req.body.id }, { "friends._id": req.user._id }],
      },
      {
        $set: {
          "friends.$.status": "Accepted",
        },
      },
      { session }
    );
    const loggedinuser = await User.updateOne(
      {
        $and: [{ _id: req.user._id }, { "friends._id": req.body.id }],
      },
      {
        $set: {
          "friends.$.status": "Accepted",
        },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      data: {
        message: "Friend request accepted",
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.type("txt");
    res.send(err);
  }
};

exports.friendrequests = async (req, res) => {
  let friendrequestArray = req.user.friends;
  friendrequestArray = friendrequestArray.filter(
    (userdoc) => userdoc.sendbyme != true && userdoc.status === "Pending"
  );
  res.status(200).json({
    status: "success",
    data: {
      friendrequestArray,
    },
  });
};
