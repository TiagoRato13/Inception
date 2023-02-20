const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const folderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    playlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
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
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Folder = model("Folder", folderSchema);

module.exports = Folder;
