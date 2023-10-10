require("dotenv").config();
const express = require("express");
const router = express.Router();
const pool = require("../db/index.js");
const {google} = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});


router.get("/", async (req, res) => {
  //console.log('from /getPlaylist');
  try{
    const {data} = await youtube.playlists.list({
      part: 'snippet',
      byUsername: 'pmf3060'
    });
    //console.log("from /getPlaylist:", data);
    res.status(200)
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;