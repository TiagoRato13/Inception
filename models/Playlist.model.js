const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
      unique: false,
      trim: true,
      lowercase: true,
    },
    song: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dkdf4rhxp/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1660229420/ironhub-project/yiisznvaxj6tzw9d0zmg.jpg",
    },
    deletebutton: {
      type: String,
      default:
        "https://res.cloudinary.com/datglss57/image/upload/v1676978195/inception/delete_yfkvpt.png",
    },
    folder: [
      {
        type: Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Playlist = model("Playlist", playlistSchema);

module.exports = Playlist;
