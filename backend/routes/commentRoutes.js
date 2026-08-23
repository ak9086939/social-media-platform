const express = require("express");
const router = express.Router();

const {
    createComment,
    getCommentsByPost,
    deleteComment
} = require("../controllers/commentController");

// CREATE COMMENT

router.post("/",createComment);

// GET COMMENTS

router.get("/:postId",getCommentsByPost);

// DELETE COMMENT

router.delete("/:id",deleteComment);

module.exports = router;
