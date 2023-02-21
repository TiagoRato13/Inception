const router = require("express").Router();
const hbs = require("hbs");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Folder = require("../models/Folder.model");
const Playlist = require("../models/Playlist.model");
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

/* SPOTIFY */
/* --- SEARCH ARTIST --- */

router.get("/search", (req, res, next) => {
  try {
    spotifyApi
      .searchArtists(req.query.artist_name, { limit: 5 })
      .then((data) => {
        console.log(
          "The received data from the API: ",
          data.body.artists.items
        );
        console.log(data.items);
        res.render("search/artist-search-results", {
          items: data.body.artists.items,
        });
        /* res.send(data.body.artists); */
      });
    // res.send(data);
  } catch (error) {
    console.log("The error while searching artists occurred: ", error);
    next(error);
  }
});

/* GET ALBUM ID */

router.get("/albums/:artistId", (req, res, next) => {
  spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then((data) => {
      let artist = data.body.items;
      res.render("search/album-search-results", { artist });
      /* res.send(data); */
    })
    .catch((error) =>
      console.log("The error while searching artists occurred: ", error)
    );
});

/* GET TRACKS */

router.get("/view-tracks/:trackId", (req, res, next) => {
  spotifyApi
    .getAlbumTracks(req.params.trackId)
    .then((data) => {
      const tracks = data.body.items;
      console.log(data);
      res.render("search/track-search-results", { tracks });
      /* res.send(tracks[0]); */
    })
    .catch((error) => console.log("Something went wrong!", error));
});

/* --- CREATE PLAYLIST --- */

router.get("/create-playlist", (req, res) =>
  res.render("inception/playlist-create")
);

router.post(
  "/create-playlist",
  fileUploader.single("image"),
  async (req, res, next) => {
    try {
      let { name, image } = req.body;
      let user = req.session.currentUser;
      let folder;
      if (req.file) {
        folder = await Folder.create({ name, image: req.file.path });
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
    } catch (error) {
      console.log(error), next(error);
    }
  }
);

/* ---EDIT PLAYLIST --- */
router.get("/playlist/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const playlist = await Folder.findById(id);
    console.log(playlist);

    res.render("edit/playlist-edit", { playlist });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/playlist/:id/edit",
  fileUploader.single("image"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      let user = await User.findById(id);
      /* console.log(folder); */
      let { name, image } = req.body;

      console.log(user);

      if (req.file) {
        user = await Folder.findByIdAndUpdate(id, {
          name,
          image: req.file.path,
        });
      } else {
        user = await Folder.findByIdAndUpdate(id, { name });
      }

      res.redirect("/home");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

/* ---PLAYLIST ID - CREATE SUBFOLDER --- */
router.get("/playlist/:id/create-playlist", async (req, res) => {
  const id = req.params.id;
  const playlistName = await Folder.findById(id);

  res.render("inception/playlist-id-create", { playlistName });
});

router.post(
  "/playlist/:id/create-playlist",
  fileUploader.single("image"),
  async (req, res, next) => {
    const id = req.params.id;
    let { name, image, value } = req.body;
    let user = req.session.currentUser._id;
    let playlist;
    if (req.file) {
      playlist = await Playlist.create({ name, image: req.file.path });
    } else {
      playlist = await Playlist.create({ name });
    }
    console.log(id);
    /* console.log(value); */
    await Folder.findByIdAndUpdate(
      id,
      { $push: { playlist: playlist } },
      { new: true }
    );
    console.log(id);
    res.redirect(`/playlist/${id}`);
    try {
    } catch (error) {
      console.log(error), next(error);
    }
  }
);

/* --- PLAYLIST ID FOLDER--- */

router.get("/playlist/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentFolder = await Folder.findById(id).populate("playlist");
    const folder = await Folder.findById(id);
    res.render("inception/playlist-id", { folder, currentFolder });
  } catch (error) {
    console.log(error), next(error);
  }
});

/* --- SUB PLAYLIST ID FOLDER--- */

router.get("/playlist/subplaylist/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentPlaylist = await Playlist.findById(id);
    console.log(currentPlaylist);
    const folder = await Folder.findById(id);
    res.render("inception/playlist-id-subfolder", { folder, currentPlaylist });
  } catch (error) {
    console.log(error), next(error);
  }
});

//Delete a playlist
router.post("/playlist/:id/delete", async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = req.session.currentUser._id;
    const currentUser = await User.findByIdAndUpdate(user, {
      $pull: { folderId: id, playlist: id },
    });

    await Folder.findByIdAndDelete(id);

    res.redirect("/home");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//Delete a subplaylist
router.post("/playlist/subplaylist/:id/delete", async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentFolder = await Folder.findByIdAndUpdate(id, {
      $pull: { playlist: id },
    });

    await Playlist.findByIdAndDelete(id);

    res.redirect("/home");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
