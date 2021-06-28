module.exports = (req) => {
  let friendsArray = req.user.friends;
  let arr = [];
  friendsArray
    .filter((userdoc) => userdoc.status === "Accepted")
    .forEach((doc) => arr.push(doc._id));
  return arr;
};
