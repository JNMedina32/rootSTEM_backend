const express = require("express");
const router = express.Router();
const pool = require("../db/index.js");
const isAuth = require("../middlewares/isAuth.js");

//------------Route for ADDING video to user_seen_videos table, then getting questions for that video
//-----From Videos.js

router.post("/", isAuth, async (req, res) => {
  const { user_id, video_id } = req.body;
  console.log("from /addViewed:", req.body);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO user_seen_videos (user_id, video_id) VALUES ($1, $2)",
      [user_id, video_id]
    );

    const query2 = await client.query(
      "SELECT * FROM questions_answers WHERE video_id = $1",
      [video_id]
    );
    console.log("from /addViewed query2:", query2);
    const questions = query2.rows;
    console.log("from /addViewed questions:", questions);
    await client.query("COMMIT");
    const userData = req.user;
    const user = { ...userData, questions };
    res.status(200).send(user);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).send(error);
  } finally {
    client.release();
  }
});

module.exports = router;
