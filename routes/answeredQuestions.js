const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth.js");
const pool = require("../db/index.js");

//--------Route to handle answered questions

router.post("/", isAuth, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { video_id, question_id, answeredCorrectly, userAnswer } = req.body;
    console.log("from /userAccount/answer-questions: req.body", req.body);
    const submitUserAnswer = await pool.query(
      "INSERT INTO answered_questions (question_id, video_id, user_id, answered_correctly, user_answer) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [question_id, video_id, user_id, answeredCorrectly, userAnswer]
    );
    if (submitUserAnswer.rows) {
      console.log(
        "from /userAccount/answer-questions: submitUserAnswer",
        submitUserAnswer
      );
      const user = req.user;
      res.status(200).send(user);
    } else {
      console.error(error);
      res.status(400).send(error);
    }
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
