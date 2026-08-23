const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getAllUsers,
    followUnfollowUser,
    getUserProfile,
    updateUserProfile
} = require("../controllers/userController");

// REGISTER

router.post("/register",registerUser);

// LOGIN

router.post("/login",loginUser);

// GET ALL USERS

router.get("/",getAllUsers);

// FOLLOW / UNFOLLOW

router.put("/:id/follow",protect,followUnfollowUser);

// UPDATE PROFILE

router.put("/:id",updateUserProfile);

// GET PROFILE

router.get("/:id",getUserProfile);

module.exports = router;
