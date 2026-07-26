const mongoose = require("mongoose");


// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(

    {

        // ==========================================
        // NAME
        // ==========================================

        name: {

            type: String,

            required: true,

            trim: true

        },


        // ==========================================
        // USERNAME
        // ==========================================

        username: {

            type: String,

            required: true,

            unique: true,

            trim: true

        },


        // ==========================================
        // EMAIL
        // ==========================================

        email: {

            type: String,

            required: true,

            unique: true,

            trim: true,

            lowercase: true

        },


        // ==========================================
        // PASSWORD
        // ==========================================

        password: {

            type: String,

            required: true

        },


        // ==========================================
        // BIO
        // ==========================================

        bio: {

            type: String,

            default: "",

            trim: true

        },


        // ==========================================
        // PROFILE IMAGE
        // ==========================================

        profileImage: {

            type: String,

            default: ""

        },


        // ==========================================
        // FOLLOWERS
        // ==========================================

        followers: [

            {

                type:

                    mongoose.Schema.Types.ObjectId,

                ref: "User"

            }

        ],


        // ==========================================
        // FOLLOWING
        // ==========================================

        following: [

            {

                type:

                    mongoose.Schema.Types.ObjectId,

                ref: "User"

            }

        ]

    },


    // ==========================================
    // TIMESTAMPS
    // ==========================================

    {

        timestamps: true

    }

);


// ==========================================
// EXPORT USER MODEL
// ==========================================

module.exports =

    mongoose.model(

        "User",

        userSchema

    );