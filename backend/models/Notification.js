const mongoose = require("mongoose");


// ==========================================
// NOTIFICATION SCHEMA
// ==========================================

const notificationSchema = new mongoose.Schema(

    {

        // ==========================================
        // NOTIFICATION RECEIVER
        // ==========================================

        recipient: {

            type:

                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        // ==========================================
        // NOTIFICATION SENDER
        // ==========================================

        sender: {

            type:

                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        // ==========================================
        // NOTIFICATION TYPE
        // ==========================================

        type: {

            type: String,

            required: true,

            enum: [

                "follow",

                "like",

                "comment"

            ]

        },


        // ==========================================
        // RELATED POST
        // ==========================================

        post: {

            type:

                mongoose.Schema.Types.ObjectId,

            ref: "Post",

            default: null

        },


        // ==========================================
        // NOTIFICATION MESSAGE
        // ==========================================

        message: {

            type: String,

            required: true

        },


        // ==========================================
        // READ STATUS
        // ==========================================

        isRead: {

            type: Boolean,

            default: false

        }

    },

    {

        timestamps: true

    }

);


// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model(

    "Notification",

    notificationSchema

);