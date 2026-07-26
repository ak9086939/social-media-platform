const mongoose = require("mongoose");


// ==========================================
// COMMENT SCHEMA
// ==========================================

const commentSchema = new mongoose.Schema(

    {
        text: {

            type: String,

            required: true

        },


        user: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        createdAt: {

            type: Date,

            default: Date.now

        }

    }

);


// ==========================================
// POST SCHEMA
// ==========================================

const postSchema = new mongoose.Schema(

    {

        content: {

            type: String,

            required: true

        },


        image: {

            type: String,

            default: ""

        },


        author: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        likes: [

            {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User"

            }

        ],


        comments: [

            commentSchema

        ]

    },


    {

        timestamps: true

    }

);


// ==========================================
// EXPORT
// ==========================================

module.exports =
    mongoose.model(

        "Post",

        postSchema

    );