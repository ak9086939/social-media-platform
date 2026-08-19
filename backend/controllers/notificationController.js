const Notification = require("../models/Notification");

// GET USER NOTIFICATIONS

const getNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.find({recipient: userId})
            .populate("sender","name username profileImage")
            .populate("post","content image")
            .sort({createdAt: -1});

        res.status(200).json({
            notifications: notifications
        });
    }

    catch (error) {
        console.error("Get Notifications Error:",error);

        res.status(500).json({
            message: error.message
        });
    }
};

// MARK NOTIFICATION AS READ

const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification =
            await Notification.findByIdAndUpdate(
                notificationId,
                {
                    isRead: true
                },
                {
                    new: true
                }
            );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification: notification
        });
    }

    catch (error) {
        console.error("Mark Read Error:",error);
        res.status(500).json({message:error.message});
    }
};

// DELETE NOTIFICATION

const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification deleted successfully"
        });
    }

    catch (error) {
        console.error("Delete Notification Error:",error);
        res.status(500).json({message:error.message});
    }
};

// MARK ALL AS READ

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.params.userId;
        await Notification.updateMany(
            {
                recipient: userId,
                isRead: false
            },
            {
                isRead: true
            }
        );
        res.status(200).json({
            message: "All notifications marked as read"
        });
    }

    catch (error) {
        console.error("Mark All Read Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// GET UNREAD NOTIFICATION COUNT

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const unreadCount =
            await Notification.countDocuments({
                recipient: userId,
                isRead: false
            });
        res.status(200).json({
            unreadCount: unreadCount
        });
    }
        
    catch (error) {
        console.error("Unread Count Error:",error);
        res.status(500).json({
            message:error.message
        });
    }
};

// EXPORT

module.exports = {
    getNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    getUnreadCount
};
