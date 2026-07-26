const express = require("express");

const router = express.Router();


const {

    getUnreadCount,

    getNotifications,

    markAsRead,

    deleteNotification,

    markAllAsRead

} = require(

    "../controllers/notificationController"

);


// ==========================================
// UNREAD COUNT
// ==========================================

router.get(

    "/user/:userId/unread-count",

    getUnreadCount

);


// ==========================================
// MARK ALL AS READ
// ==========================================

router.put(

    "/user/:userId/read-all",

    markAllAsRead

);


// ==========================================
// GET USER NOTIFICATIONS
// ==========================================

router.get(

    "/:userId",

    getNotifications

);


// ==========================================
// MARK ONE AS READ
// ==========================================

router.put(

    "/:id/read",

    markAsRead

);


// ==========================================
// DELETE NOTIFICATION
// ==========================================

router.delete(

    "/:id",

    deleteNotification

);


module.exports = router;