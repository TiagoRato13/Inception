const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Folder = require("../models/Folder.model");
const fileUploader = require("../config/cloudinary.config");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");
// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

router.get("/home", isLoggedIn, async (req, res, next) => {
  let user = req.session.currentUser.username;
  let thisUser = await User.findOne({ user }).populate("folderId");

  res.render("inception/home", { thisUser });
});

router.get("/create-playlist", (req, res) =>
  res.render("inception/playlist-create")
);

router.post("/create-playlist", async (req, res, next) => {
  let { name, image } = req.body;
  let user = req.session.currentUser;
  let folder;
  if (image !== "") {
    folder = await Folder.create({ name, image });
  } else {
    folder = await Folder.create({ name });
  }
  console.log(folder);
  await User.findByIdAndUpdate(
    user._id,
    { $push: { folderId: folder } },
    { new: true }
  );
  res.redirect("/home");
  try {
  } catch (error) {
    console.log(error), next(error);
  }
});

module.exports = router;
