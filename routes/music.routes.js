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
  const user = req.session.currentUser._id;
  const currentUser = await User.findById(user).populate("folderId");
  res.render("inception/home", { currentUser });
});

/* --- CREATE PLAYLIST --- */

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

/* ---PLAYLIST ID - CREATE SUBFOLDER --- */
router.get("/playlist/:id/create-playlist", async (req, res) => {
  const id = req.params.id;
  const playlistName = await Folder.findById(id);

  res.render("inception/playlist-id-create", { playlistName });
});

router.post("/playlist/:id/create-playlist", async (req, res, next) => {
  let { name, image } = req.body;
  let user = req.session.currentUser;
  let playlist;
  if (image !== "") {
    folder = await Playlist.create({ name, image });
  } else {
    folder = await Playlist.create({ name });
  }
  console.log(folder);
  await Playlist.findByIdAndUpdate(
    user._id,
    { $push: { playlist: playlist } },
    { new: true }
  );
  res.redirect("/home");
  try {
  } catch (error) {
    console.log(error), next(error);
  }
});

/* --- PLAYLIST ID FOLDER--- */

router.get("/playlist/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const folder = await Folder.findById(id);
    res.render("inception/playlist-id", { folder });
  } catch (error) {
    console.log(error), next(error);
  }
});

router.get("/playlist/subplaylist/:id");

module.exports = router;
