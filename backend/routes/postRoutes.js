const express = require("express");
const router = express.Router();
const {
    createPost,
    getAllPosts,
    likePost,
    addComment,
    deleteComment,
    updatePost,
    deletePost
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

// GET ALL POSTS

router.get("/",getAllPosts);

// CREATE POST

router.post("/",authMiddleware,createPost);

// LIKE / UNLIKE POST

router.put("/:id/like",authMiddleware,likePost);

// ADD COMMENT

router.post("/:id/comments",authMiddleware,addComment);

// DELETE COMMENT

router.delete("/:postId/comments/:commentId",authMiddleware,deleteComment);

// UPDATE POST

router.put("/:id",authMiddleware,updatePost);

// DELETE POST

router.delete("/:id",authMiddleware,deletePost);

module.exports = router;
