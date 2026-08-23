const Comment = require("../models/Comment");

// CREATE COMMENT

const createComment = async (req, res) => {
    try {
        const {text,user,post} = req.body;
        if (!text || !user || !post) {
            return res.status(400).json({
                message: "Text, user and post are required"
            });
        }

        const comment = await Comment.create({text,user,post});
        const populatedComment = await Comment.findById(comment._id).populate("user","name username profileImage");
        
        res.status(201).json(populatedComment);

    } catch (error) {
        console.log("Create Comment Error:",error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET COMMENTS BY POST

const getCommentsByPost = async (req,res) => {
    try {
        const comments = await Comment.find({post:req.params.postId})
            .populate("user","name username profileImage")
            .sort({createdAt:-1});
        res.json(comments);

    } catch (error) {
        console.log("Get Comments Error:",error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// DELETE COMMENT

const deleteComment = async (req,res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // CHECK COMMENT OWNER

        const userId = req.body.userId;
        if (userId && String(comment.user) !== String(userId)) {
            return res.status(403).json({
                message: "You can delete only your own comment"
            });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.log("Delete Comment Error:",error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// EXPORT

module.exports = {
    createComment,
    getCommentsByPost,
    deleteComment
};
