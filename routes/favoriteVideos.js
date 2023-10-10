const express = require("express");
const router = express.Router();
const pool = require("../db/index.js");
const isAuth = require("../middlewares/isAuth.js");


//--------Route for INSERT, DELETE from user_favorite_videos table
router.post("/", isAuth, async (req, res) => {
  try {
    const { user_id, video_id, liked } = req.body;
    console.log("from /userAccount/favorites: req.body", req.body);
    if (liked) {
      const favoriteAdded = await pool
        .query(
          "INSERT INTO user_favorite_videos (user_id, video_id) VALUES ($1, $2) RETURNING *",
          [user_id, video_id]
        );
      if (favoriteAdded.rows) {
        console.log("from /userAccount/favorites: favoriteAdded", favoriteAdded);
        res.status(200).send();
      } else {
        console.error(error);
        res.status(400).send();
      };
        
    } else {
      const favoriteRemoved = await pool
        .query(
          "DELETE FROM user_favorite_videos WHERE user_id = $1 AND video_id = $2 RETURNING *",
          [user_id, video_id]
        )
      if (favoriteRemoved.rows) {
        console.log("from /userAccount/favorites: favoriteRemoved", favoriteRemoved);
        res.status(200).send();
      } else {
        console.error(error);
        res.status(400).send();
      };
    }
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;