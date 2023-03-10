const router = require("express").Router();
const mongoose = require("mongoose");
const axios = require("axios");
const querystring = require("querystring");

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

router.get("/create/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope =
    "user-read-private user-read-email playlist-modify-private playlist-modify-public";

  const queryParams = querystring.stringify({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state: state,
    scope: scope,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

router.get("/callback", (req, res, next) => {
  const code = req.query.code || null;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      //redirect to index and pass along tokens in query params
      if (response.status === 200) {
        const { access_token, refresh_token } = response.data;
        console.log("response.data:", response.data);
        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
        });

        res.redirect(`/create/${queryParams}`); // substituir pra nosso app.
      } else {
        res.send(response);
      }
    })
    .catch((err) => {
      next(err);
    });
});

//Saves the access token omn the session and the user profile on the applications
router.get(
  "/create/access_token=:accessToken&refresh_token=:refreshToken",
  (req, res, next) => {
    req.app.locals.accessToken = req.params.accessToken;
    req.app.locals.refreshToken = req.params.refreshToken;

    axios
      .get("https://api.spotify.com/v1/me", {
        params: { limit: 50, offset: 0 },
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + req.app.locals.accessToken,
          "Content-Type": "application/json",
        },
      })
      .then((myInfo) => {
        const myProfile = myInfo.data;
        req.app.locals.myProfile = myProfile;
        req.session.myProfile = myProfile;
        res.render("inception/playlist-id-create");
      })
      .catch((err) => next(err));
  }
);

router.get("/refresh_token", (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      res.redirect(`/?${querystring.stringify({ error: "invalid_token" })}`);
    })
    .catch((error) => {
      res.send(error);
    });
});

module.exports = router;
