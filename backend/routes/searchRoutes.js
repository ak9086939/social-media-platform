const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

// SEARCH USERS AND POSTS

router.get("/", async (req, res) => {
    try {
        const searchText = req.query.q;
        if (!searchText) {
            return res.status(400).json({
                message:"Please enter search text"
            });
        }

        // Search Users
        const users =
            await User.find({
                $or: [
                    {
                        name: {
                            $regex:searchText,
                            $options:"i"
                        }
                    },
                    
                    {
                        username: {
                            $regex:searchText,
                            $options:"i"
                        }
                    }
                ]
            }).select("name username profileImage");

        // Search Posts
        const posts =
            await Post.find({
                content: {
                    $regex:searchText,
                    $options:"i"
                }

            }).populate("author","name username profileImage");

        res.json({
            users: users,
            posts: posts
        });

    } catch (error) {
        console.log("Search Error:",error);
        res.status(500).json({
            message:"Server error"
        });
    }
});


module.exports =
    router;
