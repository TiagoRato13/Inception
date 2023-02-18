const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const folderSchema = new Schema(
  {
    name: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Folder = model("Folder", folderSchema);

module.exports = Folder;
