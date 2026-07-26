const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Post = require("../models/Post");

const Notification =
    require("../models/Notification");


// ==================================================
// REGISTER USER
// ==================================================

const registerUser = async (req, res) => {

    try {

        const {

            name,

            username,

            email,

            password

        } = req.body;


        const existingUser =
            await User.findOne({

                $or: [

                    { email: email },

                    { username: username }

                ]

            });


        if (existingUser) {

            return res.status(400).json({

                message:
                    "User already exists"

            });

        }


        const hashedPassword =
            await bcrypt.hash(

                password,

                10

            );


        const user =
            await User.create({

                name,

                username,

                email,

                password:
                    hashedPassword

            });


        res.status(201).json({

            message:
                "User registered successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                username:
                    user.username,

                email:
                    user.email

            }

        });

    }

    catch (error) {

        console.error(

            "Register Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==================================================
// LOGIN USER
// ==================================================

const loginUser = async (req, res) => {

    try {

        const {

            email,

            password

        } = req.body;


        const user =
            await User.findOne({

                email

            });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        const isPasswordCorrect =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!isPasswordCorrect) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        const token =
            jwt.sign(

                {

                    userId:
                        user._id

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:
                        "7d"

                }

            );


        res.status(200).json({

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                username:
                    user.username,

                email:
                    user.email,

                bio:
                    user.bio || "",

                profileImage:
                    user.profileImage || ""

            }

        });

    }

    catch (error) {

        console.error(

            "Login Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==================================================
// GET ALL USERS
// ==================================================

const getAllUsers = async (req, res) => {

    try {

        const users =
            await User.find()

                .select("-password");


        res.status(200).json(users);

    }

    catch (error) {

        console.error(

            "Get All Users Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==================================================
// FOLLOW / UNFOLLOW USER
// ==================================================

const followUnfollowUser = async (req, res) => {

    try {

        const currentUserId =
            req.userId;


        const targetUserId =
            req.params.id;


        if (

            !currentUserId ||

            !targetUserId

        ) {

            return res.status(400).json({

                message:
                    "User ID is required"

            });

        }


        // ------------------------------------------
        // CANNOT FOLLOW YOURSELF
        // ------------------------------------------

        if (

            String(currentUserId) ===

            String(targetUserId)

        ) {

            return res.status(400).json({

                message:
                    "You cannot follow yourself"

            });

        }


        const currentUser =
            await User.findById(

                currentUserId

            );


        const targetUser =
            await User.findById(

                targetUserId

            );


        if (

            !currentUser ||

            !targetUser

        ) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        // ------------------------------------------
        // ENSURE ARRAYS EXIST
        // ------------------------------------------

        if (

            !Array.isArray(

                currentUser.following

            )

        ) {

            currentUser.following = [];

        }


        if (

            !Array.isArray(

                targetUser.followers

            )

        ) {

            targetUser.followers = [];

        }


        // ------------------------------------------
        // CHECK FOLLOW STATUS
        // ------------------------------------------

        const alreadyFollowing =

            currentUser.following.some(

                function (id) {

                    return (

                        String(id) ===

                        String(targetUserId)

                    );

                }

            );


        // ==================================================
        // UNFOLLOW
        // ==================================================

        if (alreadyFollowing) {

            currentUser.following =

                currentUser.following.filter(

                    function (id) {

                        return (

                            String(id) !==

                            String(targetUserId)

                        );

                    }

                );


            targetUser.followers =

                targetUser.followers.filter(

                    function (id) {

                        return (

                            String(id) !==

                            String(currentUserId)

                        );

                    }

                );


            await currentUser.save();

            await targetUser.save();


            // Delete follow notifications
            await Notification.deleteMany({

                recipient:
                    targetUser._id,

                sender:
                    currentUser._id,

                type:
                    "follow"

            });


            return res.status(200).json({

                message:
                    "Unfollowed successfully",

                isFollowing:
                    false,

                followers:

                    targetUser.followers.length,

                following:

                    currentUser.following.length

            });

        }


        // ==================================================
        // FOLLOW
        // ==================================================

        currentUser.following.push(

            targetUser._id

        );


        targetUser.followers.push(

            currentUser._id

        );


        await currentUser.save();

        await targetUser.save();


        // ==================================================
        // CHECK EXISTING NOTIFICATION
        // ==================================================

        const existingNotification =

            await Notification.findOne({

                recipient:
                    targetUser._id,

                sender:
                    currentUser._id,

                type:
                    "follow"

            });


        // ==================================================
        // CREATE NOTIFICATION
        // ==================================================

        if (!existingNotification) {

            await Notification.create({

                recipient:
                    targetUser._id,

                sender:
                    currentUser._id,

                type:
                    "follow",

                message:

                    `${currentUser.name} started following you`

            });

        }


        return res.status(200).json({

            message:
                "Followed successfully",

            isFollowing:
                true,

            followers:

                targetUser.followers.length,

            following:

                currentUser.following.length

        });

    }

    catch (error) {

        console.error(

            "Follow Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==================================================
// GET USER PROFILE
// ==================================================

const getUserProfile = async (req, res) => {

    try {

        const userId =
            req.params.id;


        const user =
            await User.findById(

                userId

            )

                .select("-password")

                .populate(

                    "followers",

                    "name username profileImage"

                )

                .populate(

                    "following",

                    "name username profileImage"

                );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        const posts =
            await Post.find({

                author:
                    userId

            })

                .populate(

                    "author",

                    "name username profileImage"

                )

                .sort({

                    createdAt:
                        -1

                });


        res.status(200).json({

            user,

            posts

        });

    }

    catch (error) {

        console.error(

            "Get Profile Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==================================================
// UPDATE USER PROFILE
// ==================================================

const updateUserProfile = async (req, res) => {

    try {

        const user =
            await User.findById(

                req.params.id

            );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        if (

            req.body.name !== undefined

        ) {

            user.name =
                req.body.name;

        }


        if (

            req.body.bio !== undefined

        ) {

            user.bio =
                req.body.bio;

        }


        if (

            req.body.profileImage !== undefined

        ) {

            user.profileImage =

                req.body.profileImage;

        }


        const updatedUser =
            await user.save();


        res.status(200).json({

            message:
                "Profile updated successfully",

            user:
                updatedUser

        });

    }

    catch (error) {

        console.error(

            "Update Profile Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    registerUser,

    loginUser,

    getAllUsers,

    followUnfollowUser,

    getUserProfile,

    updateUserProfile

};