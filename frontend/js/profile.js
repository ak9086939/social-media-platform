const API_URL = "http://localhost:5000/api";

// USER DATA

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");
const currentUser = userData ? JSON.parse(userData) : null;

// GET CURRENT USER ID

function getUserId(user) {
    if (!user) {
        return null;
    }

    if (typeof user === "string") {
        return user;
    }

    return (
        user._id ||
        user.id ||
        user.userId ||
        user.user?._id ||
        user.user?.id ||
        null
    );
}

const currentUserId = getUserId(currentUser);

// PROFILE ID FROM URL

const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get("id");

// NAVBAR

function displayNavbar() {
    const navLinks = document.getElementById("nav-links");

    if (!navLinks) {
        return;
    }

    if (currentUser && currentUserId) {
        navLinks.innerHTML = `
            <a href="index.html">
                Home
            </a>

            <a href="profile.html?id=${currentUserId}">
                My Profile
            </a>

            <a href="notifications.html">
                🔔 Notifications
            </a>

            <button id="logout-btn">
                Logout
            </button>
        `;

        document.getElementById("logout-btn")
            .addEventListener(
                "click",
                function () {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    window.location.href = "login.html";
                }
            );
    }
}

// GET PROFILE

async function getProfile() {
    if (!profileId) {
        return;
    }

    try {
        const response =
            await fetch(
                API_URL +
                "/users/" +
                profileId,
                {
                    headers: {
                        "Authorization":
                            "Bearer " +
                            token
                    }
                }
            );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Profile not found");
        }

        displayProfile(data.user);
        displayPosts(data.posts);
    }

    catch (error) {
        console.error("Profile Error:",error);

        const profileInfo = document.getElementById("profile-info");

        if (profileInfo) {
            profileInfo.innerHTML = `
                <h2>Profile not found</h2>
            `;
        }
    }
}

// DISPLAY PROFILE

function displayProfile(user) {
    const profileInfo = document.getElementById("profile-info");

    if (!profileInfo) {
        return;
    }

    const isOwnProfile = String(profileId) === String(currentUserId);

    const isFollowing =
        user.followers?.some(
            function (follower) {
                return (
                    String(
                        getUserId(follower)
                    ) ===
                    String(currentUserId)
                );
            }
        );

    profileInfo.innerHTML = `
        <div class="profile-header">

            <img
                src="${
                    user.profileImage ||
                    "https://via.placeholder.com/150"
                }"

                class="profile-image"
                alt="Profile Image"
            >

            <div class="profile-details">

                <h1>
                    ${user.name}
                </h1>

                <p class="username">
                    @${user.username}
                </p>

                <p class="bio">
                    ${user.bio || "No bio available"}
                </p>

                <div class="profile-stats">

                    <button
                        class="stat-button"
                        onclick="showUsers('followers')"
                    >

                        <strong>
                            ${user.followers?.length || 0}
                        </strong>

                        <span>
                            Followers
                        </span>

                    </button>

                    <button
                        class="stat-button"
                        onclick="showUsers('following')"
                    >
                        <strong>
                            ${user.following?.length || 0}
                        </strong>

                        <span>
                            Following
                        </span>

                    </button>

                </div>

                ${
                    isOwnProfile
                        ? `
                            <button
                                id="edit-profile-btn"
                            >
                                ✏️ Edit Profile
                            </button>
                        `
                        : `
                            <button
                                id="follow-btn"
                                class="${
                                    isFollowing
                                        ? "following"
                                        : ""
                                }"
                            >
                                ${
                                    isFollowing
                                        ? "Following"
                                        : "Follow"
                                }

                            </button>
                        `
                }
                
            </div>
            
        </div>
        
    `;


    if (isOwnProfile) {
        document.getElementById("edit-profile-btn")
            .addEventListener(
                "click",
                function () {
                    editProfile(user);
                }
            );
    }

    if (!isOwnProfile) {
        document.getElementById("follow-btn")
            .addEventListener("click",followUser);
    }
}

// EDIT PROFILE

function editProfile(user) {
    const newName =
        prompt("Enter your name:",user.name);

    if (newName === null) {
        return;
    }

    const newBio =
        prompt("Enter your bio:",user.bio || "");

    if (newBio === null) {
        return;
    }

    const newImage =
        prompt(
            "Enter profile image URL:",
            user.profileImage || ""
        );

    if (newImage === null) {
        return;
    }
    
    updateProfile(
        newName,
        newBio,
        newImage
    );
}

// UPDATE PROFILE

async function updateProfile(
    name,
    bio,
    profileImage
) {

    try {
        const response =
            await fetch(
                API_URL +
                "/users/" +
                profileId,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Authorization": "Bearer " + token
                    },

                    body:
                        JSON.stringify({
                            name,
                            bio,
                            profileImage
                        })
                }
            );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Profile update failed");
            return;
        }

        alert("Profile updated successfully!");
        if (String(profileId) === String(currentUserId)) {
            const updatedUser = {
                ...currentUser,
                name,
                bio,
                profileImage
            };

            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedUser
                )
            );
        }
        getProfile();
    }

    catch (error) {
        console.error("Update Profile Error:",error);
    }
}

// FOLLOW / UNFOLLOW

async function followUser() {

    if (!currentUserId) {
        alert("Please login first");
        return;
    }

    try {
        const response =
            await fetch(
                API_URL +
                "/users/" +
                profileId +
                "/follow",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Authorization": "Bearer " + token
                    },

                    body:
                        JSON.stringify({
                            currentUserId
                        })
                }
            );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Follow failed");
            return;
        }
        getProfile();
    }

    catch (error) {
        console.error("Follow Error:",error);
    }
}

// DISPLAY POSTS

function displayPosts(posts) {
    const postsContainer =
        document.getElementById("posts-container");

    if (!postsContainer) {
        return;
    }

    postsContainer.innerHTML = "";

    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = `
            <p>
                No posts yet.
            </p>
        `;
        return;
    }

    posts.forEach(
        function (post) {
            const postCard = document.createElement("div");
            postCard.className = "post-card";
            postCard.id = "post-" + post._id;
            postCard.innerHTML = `
                <p>
                    ${post.content || ""}
                </p>

                ${
                    post.image
                        ? `
                            <img
                                src="${post.image}"
                                class="post-image"
                                alt="Post Image"
                            >
                        `
                        : ""
                }

                <small>
                    ${
                        post.createdAt
                            ? new Date(
                                post.createdAt
                            ).toLocaleString()
                            : ""
                    }
                </small>
            `;

            postsContainer.appendChild(postCard);
        }
    );
}

// FOLLOWERS / FOLLOWING

async function showUsers(type) {

    try {
        const response =
            await fetch(
                API_URL +
                "/users/" +
                profileId,
                {
                    headers: {
                        "Authorization": "Bearer" + token

                    }
                }
            );

        const data = await response.json();
        const users =
            type === "followers"
                ? data.user.followers
                : data.user.following;
        
        const section = document.getElementById("user-list-section");

        if (!section) {
            return;
        }

        section.innerHTML = `
            <div class="user-list-card">
                <div class="user-list-header">
                    <h2>
                        ${
                            type ===
                            "followers"
                                ? "Followers"
                                : "Following"
                        }
                    </h2>

                    <button
                        onclick="closeUserList()"
                    >
                        ✖
                    </button>

                </div>

                ${
                    !users ||
                    users.length === 0
                        ? `
                            <p>
                                No users found.
                            </p>
                        `
                        : users.map(
                            function (user) {
                                return `
                                    <div class="user-list-item">
                                        <img
                                            src="${
                                                user.profileImage ||
                                                "https://via.placeholder.com/50"
                                            }"
                                        >
                                        <div>
                                            <a
                                                href="profile.html?id=${user._id}"
                                            >
                                                ${user.name}
                                            </a>

                                            <p>
                                                @${user.username}
                                            </p>

                                        </div>

                                    </div>
                                    
                                `;

                            }

                        ).join("")

                }


            </div>

        `;

    }


    catch (error) {
        console.error("Show Users Error:",error);
    }
}

// CLOSE USER LIST

function closeUserList() {
    const section = document.getElementById("user-list-section");

    if (section) {
        section.innerHTML = "";
    }
}


// PAGE LOAD

displayNavbar();
getProfile();
