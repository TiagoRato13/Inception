const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const songSchema = new Schema(
  {
    name: String,
    image: String,
    artist: String,
    title: String,
    album: String,
    length: String,
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Song = model("Song", songSchema);

module.exports = Song;
