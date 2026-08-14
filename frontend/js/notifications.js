const API_URL = "http://localhost:5000/api";

// USER DATA

const userData = localStorage.getItem("user");
const currentUser = userData ? JSON.parse(userData) : null;
const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;
const token = localStorage.getItem("token");

// NAVBAR

function displayNavbar() {
    const navLinks = document.getElementById("nav-links");
    if (!navLinks) {
        return;
    }

    if (
        currentUser && currentUserId
    ) {
        navLinks.innerHTML = `
            <a href="index.html">
                Home
            </a>

            <a href="profile.html?id=${currentUserId}">
                My Profile
            </a>

            <a href="notifications.html">
                🔔 Notifications
                <span
                    id="notification-count"
                    class="notification-count"
                >
                    0
                </span>
            </a>

            <button id="logout-btn">
                Logout
            </button>
        `;

        const logoutButton = document.getElementById("logout-btn");

        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                function () {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    window.location.href = "login.html";
                }
            );
        }
    }
}

// GET UNREAD NOTIFICATION COUNT

async function updateNavbarNotificationCount() {
    if (!currentUserId) {
        return;
    }

    try {
        const response =
            await fetch(
                API_URL +
                "/notifications/user/" +
                currentUserId +
                "/unread-count"
            );

        const data = await response.json();
        const countElement = document.getElementById("notification-count");

        if (!countElement) {
            return;
        }

        if (data.unreadCount > 0) {
            countElement.textContent = data.unreadCount;
            countElement.style.display = "inline-block";
        }

        else {
            countElement.style.display = "none";
        }
    }

    catch (error) {
        console.error("Unread Count Error:",error);
    }
}

// GET NOTIFICATIONS

async function getNotifications() {
    if (!currentUserId) {
        alert("Please login first");
        return;
    }

    try {
        const response =
            await fetch(
                API_URL +
                "/notifications/" +
                currentUserId
            );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to get notifications");
        }

        displayNotifications(data.notifications);
        updateNavbarNotificationCount();
    }

    catch (error) {
        console.error("Get Notifications Error:",error);

        const container = document.getElementById("notifications-container");

        if (container) {
            container.innerHTML = `
                <p>
                    Failed to load notifications.
                </p>
            `;
        }
    }
}

// DISPLAY NOTIFICATIONS

function displayNotifications(
    notifications
) {
    const container =
        document.getElementById("notifications-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!notifications || notifications.length === 0) {
        container.innerHTML = `
            <p>
                No notifications yet 🔔
            </p>
        `;
        return;
    }

    notifications.forEach(
        function (notification) {
            const notificationDiv = document.createElement("div");

            notificationDiv.className = notification.isRead ? "notification read" : "notification unread";

            const sender = notification.sender;
            
            const senderName = sender ? sender.name : "Someone";

            notificationDiv.innerHTML = `
                <div
                    class="notification-content"
                    style="cursor: pointer;"
                >
                    <strong>
                        ${senderName}
                    </strong>

                    <p>
                        ${notification.message}
                    </p>

                    <small>
                        ${
                            new Date(notification.createdAt).toLocaleString()
                        }
                    </small>
                    
                </div>

                <div class="notification-actions">
                    ${
                        notification.isRead
                            ? ""
                            : `
                                <button
                                    class="read-btn"
                                    data-id="${notification._id}"
                                >
                                    Mark as Read
                                </button>
                            `
                    }

                    <button
                        class="delete-btn"
                        data-id="${notification._id}"
                    >
                        🗑️ Delete
                    </button>

                </div>
            `;

            container.appendChild(notificationDiv);

            // OPEN PROFILE OR POST

            const notificationContent = notificationDiv.querySelector(".notification-content");

            if (notificationContent) {
                notificationContent.addEventListener(
                    "click",
                    function () {

                        // FOLLOW NOTIFICATION
                        if (
                            notification.type === "follow") {

                            if (notification.sender && notification.sender._id) {
                                window.location.href = "profile.html?id=" + notification.sender._id;
                            }
                        }

                        // LIKE / COMMENT NOTIFICATION
                        else if (
                            (
                                notification.type ===
                                "like" ||
                                notification.type ===
                                "comment"
                            ) &&
                            notification.post &&
                            notification.post._id
                        ) {
                            window.location.href = "index.html#post-" + notification.post._id;
                        }
                    }
                );
            }
        }
    );
    addNotificationEvents();
}

// MARK ONE NOTIFICATION AS READ

async function markAsRead(
    notificationId
) {

    try {
        const response =
            await fetch(
                API_URL +
                "/notifications/" +
                notificationId +
                "/read",
                {
                    method: "PUT",
                    headers: {
                        "Authorization":
                            "Bearer " +
                            token
                    }
                }
            );

        if (response.ok) {
            await getNotifications();
            updateNavbarNotificationCount();
        }
    }

    catch (error) {
        console.error("Mark Read Error:",error);
    }
}

// DELETE NOTIFICATION

async function deleteNotification(
    notificationId
) {

    if (
        !confirm("Delete this notification?")
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                API_URL +
                "/notifications/" +
                notificationId,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

        if (response.ok) {
            await getNotifications();
            updateNavbarNotificationCount();
        }
    }

    catch (error) {
        console.error("Delete Notification Error:",error);
    }
}

// MARK ALL NOTIFICATIONS AS READ

async function markAllAsRead() {
    if (!currentUserId) {
        return;
    }

    try {
        const response =
            await fetch(
                API_URL +
                "/notifications/user/" +
                currentUserId +
                "/read-all",
                {
                    method: "PUT",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

        if (response.ok) {
            await getNotifications();
            updateNavbarNotificationCount();
        }
    }

    catch (error) {
        console.error("Mark All Read Error:",error);
    }
}

// ADD NOTIFICATION EVENTS

function addNotificationEvents() {

    document.querySelectorAll(".read-btn")
        .forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        markAsRead(button.dataset.id);
                    }
                );
            }
        );

    document.querySelectorAll(".delete-btn")
        .forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        deleteNotification(button.dataset.id);
                    }
                );
            }
        );
}

// MARK ALL BUTTON EVENT

const markAllButton =
    document.getElementById("mark-all-read-btn");

if (markAllButton) {
    markAllButton.addEventListener(
        "click",
        markAllAsRead
    );
}

// PAGE LOAD

displayNavbar();
getNotifications();
updateNavbarNotificationCount();
