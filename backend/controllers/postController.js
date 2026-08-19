const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

// CREATE POST

const createPost = async (req, res) => {
    try {
        const {
            content,
            image
        } = req.body;

        const userId = req.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message:"Post content is required"
            });
        }

        const post =
            await Post.create({
                content:
                    content.trim(),
                image:
                    image || "",
                author:
                    userId
            });

        const populatedPost =
            await Post.findById(
                post._id
            ).populate(
                "author",
                "name username profileImage"
            );

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });

    } catch (error) {
        console.error("Create Post Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// GET ALL POSTS

const getAllPosts = async (req, res) => {
    try {
        const posts =
            await Post.find()
                .populate("author","name username profileImage")
                .populate("likes","name username profileImage")
                .populate("comments.user","name username profileImage")

                .sort({createdAt:-1});
        
        res.status(200).json({
            posts:posts
        });

    } catch (error) {
        console.error("Get Posts Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// LIKE / UNLIKE POST

const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message:"Post not found"
            });
        }

        if (!Array.isArray(post.likes)) {
            post.likes = [];
        }

        const alreadyLiked =
            post.likes.some(
                function (id) {
                    return (
                        String(id) ===
                        String(userId)
                    );
                }
            );

        if (alreadyLiked) {

            post.likes =
                post.likes.filter(
                    function (id) {
                        return (
                            String(id) !==
                            String(userId)
                        );
                    }
                );

            await post.save();
            return res.status(200).json({
                message:"Post unliked",
                isLiked:false,
                likes:post.likes.length
            });
        }

        post.likes.push(userId);
        await post.save();

        if (
            String(post.author) !==
            String(userId)
        ) {
            await Notification.create({
                recipient:post.author,
                sender:userId,
                post:post._id,
                type:"like",
                message:"liked your post"
            });
        }

        res.status(200).json({
            message:"Post liked",
            isLiked:true,
            likes:post.likes.length
        });

    } catch (error) {
        console.error("Like Post Error:",error
        );
        res.status(500).json({
            message:error.message
        });
    }
};

// ADD COMMENT

const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const text = req.body.text;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message:"Comment cannot be empty"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message:"Post not found"
            });
        }

        if (!Array.isArray(post.comments)) {
            post.comments = [];
        }

        post.comments.push({
            user:userId,
            text:
                text.trim()
        });

        await post.save();
        if (
            String(post.author) !==
            String(userId)
        ) {
            await Notification.create({
                recipient:post.author,
                sender:userId,
                post:post._id,
                type:"comment",
                message:"commented on your post"
            });
        }

        const updatedPost = await Post.findById(postId)
                .populate("author","name username profileImage")
                .populate("comments.user","name username profileImage");

        res.status(201).json({
            message:"Comment added successfully",
            post:updatedPost
        });

    } catch (error) {
        console.error("Add Comment Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// DELETE COMMENT

const deleteComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const userId = req.userId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message:"Post not found"
            });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                message:"Comment not found"
            });
        }

        if (
            String(comment.user) !==
            String(userId)
        ) {
            return res.status(403).json({
                message:"You can delete only your own comment"
            });
        }

        post.comments.pull(commentId);
        await post.save();
        res.status(200).json({
            message:"Comment deleted successfully"
        });

    } catch (error) {
        console.error("Delete Comment Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// UPDATE POST

const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const content = req.body.content;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message:"Post content is required"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message:"Post not found"
            });
        }

        if (
            String(post.author) !==
            String(userId)
        ) {
            return res.status(403).json({
                message:"You can edit only your own post"
            });
        }

        post.content = content.trim();
        await post.save();
        res.status(200).json({
            message:"Post updated successfully",
            post:post
        });

    } catch (error) {
        console.error("Update Post Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// DELETE POST

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message:"Post not found"
            });
        }

        if (
            String(post.author) !==
            String(userId)
        ) {
            return res.status(403).json({
                message:"You can delete only your own post"
            });
        }

        await Post.findByIdAndDelete(postId);
        await Notification.deleteMany({
            post:postId
        });
        res.status(200).json({
            message:"Post deleted successfully"
        });

    } catch (error) {
        console.error("Delete Post Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// EXPORT

module.exports = {
    createPost,
    getAllPosts,
    likePost,
    addComment,
    deleteComment,
    updatePost,

    deletePost

};
