const express = require("express");
require("dotenv").config();
const router = express.Router();
const pool = require("../db/index.js");
require("../auth.js");
const fetch = require("node-fetch");

//------------Gets all videos from DB
router.get("/", async (req, res) => {
  const { learner, searchTerm } = req.query;
  console.log("from router/home learner, searchTerm", learner, searchTerm);
  let queryStr = "";
  if (learner) {
    const user = req.user;
    const { preferences } = user;
    const truePreferences = Object.keys(preferences).filter(
      (key) => preferences[key] === true
    );
    queryStr = truePreferences
      .map((field) => `stem_field = '${field}'`)
      .join(" OR ");
  }

  try {
    if (searchTerm) {
      const searchQuery = `SELECT * FROM videos WHERE title ILIKE $1 OR description ILIKE $1 OR stem_cat ILIKE $1 OR video_owner_channel_title ILIKE $1 OR stem_field ILIKE $1 OR captions_text ILIKE $1 ORDER BY published_date_time LIMIT 10`;
      const videosData = await pool.query(searchQuery, [`%${searchTerm}%`]);
      const data = videosData.rows;
      if (data) {
        res.status(200).send(data);
      } else {
        res.status(400).send({ error: "Error with request" });
      }
    } else if (learner) {
      const videosData = await pool.query(
        `SELECT * FROM videos WHERE ${queryStr} ORDER BY published_date_time LIMIT 10`
      );
      const data = videosData.rows;
      if (data) {
        res.status(200).send(data);
      } else {
        res.status(400).send({ error: "Error with request" });
      }
    } else {
      const videosData = await pool.query(
        "SELECT * FROM videos ORDER BY published_date_time LIMIT 10"
      );
      const data = videosData.rows;
      if (data) {
        res.status(200).send(data);
      } else {
        res.status(400).send({ error: "Error with request" });
      }
    }
  } catch (error) {
    console.error(error);
    res.send({error});
  }
});

//------------Calls Youtube API and stores NEW data in DB
router.get("/youtubeVideos", async (req, res) => {
  try {
    let nextPageToken = "";
    do {
      const url = `${process.env.YOUTUBE_API}&pageToken=${nextPageToken}`;
      const response = await fetch(url);
      if (response.ok) {
        const videos = await response.json();
        //console.log("from router/youtubeVideos videos", videos);
        const { items } = videos;
        console.log(
          "from router/youtubeVideos items[0].snippet",
          items[0].snippet
        );
        await Promise.all(
          items.map(async (item) => {
            const {
              publishedAt,
              // title,
              // description,
              // thumbnails,
              // videoOwnerChannelTitle,
              // videoOwnerChannelId,
              resourceId,
              // playlistId,
            } = item.snippet;
            // const { maxres } = thumbnails;
            // let url;
            // if (!maxres) {
            //   url = "";
            // } else {
            //   url = maxres.url;
            // }
            const { videoId } = resourceId;

            await pool.query(
              "UPDATE videos SET published_date_time = $1 WHERE video_id = $2",
              [publishedAt, videoId]
            );

            // await pool.query(
            //   "INSERT INTO videos (video_id, title, description, thumbnail_url_maxres, video_owner_channel_title, video_owner_channel_id, playlist_video_id_ea) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (video_id) DO NOTHING RETURNING video_id",
            //   [
            //     videoId,
            //     title,
            //     description,
            //     url,
            //     videoOwnerChannelTitle,
            //     videoOwnerChannelId,
            //     playlistId,
            //   ]
            // );
          })
        );
        nextPageToken = videos.nextPageToken;
      } else {
        const error = await response.json();
        res.status(400).send({ error: error });
      }
    } while (nextPageToken);
    res.status(200).send({ message: "Videos saved successfully." });
  } catch (error) {
    res.status(500).send(error);
    //console.error(error);
  }
});

router.post("/youtubeCaptionsText", async (req, res) => {
  try {
    const { videoId } = req.body;
    const { captionsText } = req.body;

    console.log("from router/youtubeCaptionsText videoId", videoId);
    console.log("from router/youtubeCaptionsText captionsText", captionsText);
    const query = await pool.query(
      "UPDATE videos SET captions_text = $1 WHERE video_id = $2 RETURNING video_id, captions_text",
      [captionsText, videoId]
    );
    const results = query.rows[0];
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send(error);
    console.error(error);
  }
});

router.post("/QuestionsAnswers", async (req, res) => {
  const client = await pool.connect();

  try {
    const questionsAnswers = req.body.questionsAnswers;

    await client.query("BEGIN");

    // Iterate through video-related questions and answers and insert them into the database
    for (const videoQA of questionsAnswers) {
      const { videoId } = videoQA;
      const { questions_answers } = videoQA;

      for (const qa of questions_answers) {
        const { question, answer } = qa;
        await client.query(
          "INSERT INTO questions_answers (video_id, question, answer) VALUES ($1, $2, $3)",
          [videoId, question, answer]
        );
      }
    }

    await client.query("COMMIT");

    res
      .status(200)
      .send({ message: "Questions and answers saved successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).send(error);
    console.error(error);
  } finally {
    client.release();
  }
});

module.exports = router;
