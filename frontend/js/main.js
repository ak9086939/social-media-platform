const API_URL = "http://localhost:5000/api";


// ==================================================
// USER DATA
// ==================================================

const token = localStorage.getItem("token");

const userData = localStorage.getItem("user");

const currentUser = userData
    ? JSON.parse(userData)
    : null;


// ==================================================
// GET USER ID
// ==================================================

function getUserId(user) {

    if (!user) {

        return null;

    }


    if (typeof user === "string") {

        return user;

    }


    if (typeof user === "object") {

        return (

            user._id ||

            user.id ||

            user.userId ||

            user.user?._id ||

            user.user?.id ||

            null

        );

    }


    return null;

}


// ==================================================
// CURRENT USER ID
// ==================================================

const currentUserId =

    getUserId(currentUser);


// ==================================================
// DEBUG
// ==================================================

console.log(

    "Current User:",

    currentUser

);


console.log(

    "Current User ID:",

    currentUserId

);


// ==================================================
// CREATE PROFILE LINK
// ==================================================

function createProfileLink(userId) {

    if (!userId) {

        return "#";

    }


    return (

        "profile.html?id=" +

        encodeURIComponent(

            String(userId)

        )

    );

}


// ==================================================
// NAVBAR
// ==================================================

function displayNavbar() {

    const navLinks =

        document.getElementById(

            "nav-links"

        );


    if (!navLinks) {

        return;

    }


    if (

        currentUser &&

        currentUserId

    ) {

        navLinks.innerHTML = `

            <a href="index.html">

                Home

            </a>


            <a href="${createProfileLink(currentUserId)}">

                My Profile

            </a>


            <a

                href="notifications.html"

                id="notification-link"

            >

                🔔 Notifications


                <span

                    id="notification-badge"

                    class="notification-badge"

                >

                    0

                </span>

            </a>


            <button

                id="nav-logout-btn"

            >

                Logout

            </button>

        `;


        const logoutButton =

            document.getElementById(

                "nav-logout-btn"

            );


        if (logoutButton) {

            logoutButton.addEventListener(

                "click",

                logoutUser

            );

        }


        getUnreadNotificationCount();

    }


    else {

        navLinks.innerHTML = `

            <a href="index.html">

                Home

            </a>


            <a href="login.html">

                Login

            </a>


            <a href="register.html">

                Register

            </a>

        `;

    }

}


// ==================================================
// DISPLAY USER
// ==================================================

function displayUser() {

    const userSection =

        document.getElementById(

            "user-section"

        );


    if (!userSection) {

        return;

    }


    if (currentUser) {

        userSection.innerHTML = `

            <h2>

                Welcome,

                ${currentUser.name || "User"}

                👋

            </h2>


            <p>

                @${currentUser.username || ""}

            </p>

        `;

    }


    else {

        userSection.innerHTML = `

            <h2>

                Welcome to SocialApp 🚀

            </h2>


            <p>

                Please login to create posts.

            </p>

        `;

    }

}


// ==================================================
// LOGOUT
// ==================================================

function logoutUser() {

    localStorage.removeItem(

        "token"

    );


    localStorage.removeItem(

        "user"

    );


    window.location.href =

        "login.html";

}


// ==================================================
// CREATE POST
// ==================================================

const postForm =

    document.getElementById(

        "post-form"

    );


if (postForm) {

    postForm.addEventListener(

        "submit",

        async function (event) {

            event.preventDefault();


            if (!currentUserId) {

                alert(

                    "Please login first"

                );

                return;

            }


            const contentInput =

                document.getElementById(

                    "post-content"

                );


            const imageInput =

                document.getElementById(

                    "post-image"

                );


            const content =

                contentInput

                    ? contentInput.value.trim()

                    : "";


            const image =

                imageInput

                    ? imageInput.value.trim()

                    : "";


            if (!content) {

                alert(

                    "Please write something"

                );

                return;

            }


            try {

                const response =

                    await fetch(

                        API_URL +

                        "/posts",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":

                                    "application/json",

                                "Authorization":

                                    "Bearer " +

                                    token

                            },

                            body:

                                JSON.stringify({

                                    content:

                                        content,

                                    image:

                                        image,

                                    author:

                                        currentUserId

                                })

                        }

                    );


                const data =

                    await response.json();


                const message =

                    document.getElementById(

                        "post-message"

                    );


                if (response.ok) {

                    if (message) {

                        message.textContent =

                            "Post created successfully!";

                        message.style.color =

                            "green";

                    }


                    postForm.reset();


                    await getPosts();

                }


                else {

                    if (message) {

                        message.textContent =

                            data.message ||

                            "Failed to create post";

                        message.style.color =

                            "red";

                    }

                }

            }


            catch (error) {

                console.error(

                    "Create Post Error:",

                    error

                );

            }

        }

    );

}


// ==================================================
// GET ALL POSTS
// ==================================================

async function getPosts() {

    try {

        const response =

            await fetch(

                API_URL +

                "/posts"

            );


        const data =

            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||

                "Failed to fetch posts"

            );

        }


        const posts =

            Array.isArray(data)

                ? data

                : data.posts || [];


        displayPosts(

            posts

        );

    }


    catch (error) {

        console.error(

            "Get Posts Error:",

            error

        );

    }

}


// ==================================================
// DISPLAY POSTS
// ==================================================

function displayPosts(posts) {

    const postsContainer =

        document.getElementById(

            "posts-container"

        );


    if (!postsContainer) {

        return;

    }


    postsContainer.innerHTML = "";


    if (

        !posts ||

        posts.length === 0

    ) {

        postsContainer.innerHTML =

            "<p>No posts available.</p>";

        return;

    }


    posts.forEach(

        function (post) {


            const postCard =

                document.createElement(

                    "div"

                );


            postCard.className =

                "post-card";


            postCard.id =

                "post-" +

                post._id;


            const author =

                post.author;


            const authorId =

                getUserId(

                    author

                );


            const authorName =

                typeof author === "object"

                    ? author.name ||

                      "Unknown User"

                    : "Unknown User";


            const authorUsername =

                typeof author === "object"

                    ? author.username ||

                      "unknown"

                    : "unknown";


            const likes =

                Array.isArray(

                    post.likes

                )

                    ? post.likes

                    : [];


            const comments =

                Array.isArray(

                    post.comments

                )

                    ? post.comments

                    : [];


            const isLiked =

                likes.some(

                    function (like) {

                        const likeId =

                            getUserId(

                                like

                            );


                        return (

                            String(

                                likeId

                            ) ===

                            String(

                                currentUserId

                            )

                        );

                    }

                );


            const isOwner =

                String(

                    authorId

                ) ===

                String(

                    currentUserId

                );


            let postHTML = "";


            // ==========================================
            // AUTHOR
            // ==========================================

            if (authorId) {

                postHTML += `

                    <h3

                        class="post-author"

                    >

                        <a

                            href="${createProfileLink(authorId)}"

                        >

                            ${authorName}

                        </a>

                    </h3>

                `;

            }


            else {

                postHTML += `

                    <h3

                        class="post-author"

                    >

                        ${authorName}

                    </h3>

                `;

            }


            // ==========================================
            // USERNAME
            // ==========================================

            postHTML += `

                <p

                    class="post-username"

                >

                    @${authorUsername}

                </p>

            `;


            // ==========================================
            // CONTENT
            // ==========================================

            postHTML += `

                <p

                    class="post-content"

                >

                    ${post.content || ""}

                </p>

            `;


            // ==========================================
            // IMAGE
            // ==========================================

            if (post.image) {

                postHTML += `

                    <img

                        src="${post.image}"

                        class="post-image"

                        alt="Post Image"

                        onerror="this.style.display='none'"

                    >

                `;

            }


            // ==========================================
            // DATE
            // ==========================================

            if (post.createdAt) {

                postHTML += `

                    <small

                        class="post-date"

                    >

                        ${new Date(

                            post.createdAt

                        ).toLocaleString()}

                    </small>

                `;

            }


            // ==========================================
            // ACTIONS
            // ==========================================

            postHTML += `

                <div

                    class="post-actions"

                >

                    <button

                        class="like-btn"

                        data-post-id="${post._id}"

                    >

                        ${

                            isLiked

                                ? "❤️ Unlike"

                                : "🤍 Like"

                        }

                    </button>


                    <span>

                        ${likes.length}

                        Likes

                    </span>

            `;


            if (isOwner) {

                postHTML += `

                    <button

                        class="edit-post-btn"

                        data-post-id="${post._id}"

                    >

                        ✏️ Edit

                    </button>


                    <button

                        class="delete-post-btn"

                        data-post-id="${post._id}"

                    >

                        🗑️ Delete

                    </button>

                `;

            }


            postHTML += `

                </div>

            `;


            // ==========================================
            // COMMENTS
            // ==========================================

            postHTML += `

                <div

                    class="comment-section"

                >

                    <input

                        type="text"

                        class="comment-input"

                        id="comment-${post._id}"

                        placeholder="Write a comment..."

                    >


                    <button

                        class="comment-btn"

                        data-post-id="${post._id}"

                    >

                        Comment

                    </button>


                    <div

                        class="comments-list"

                        id="comments-${post._id}"

                    >

            `;


            if (

                comments.length === 0

            ) {

                postHTML +=

                    "<p>No comments yet.</p>";

            }


            else {

                comments.forEach(

                    function (comment) {


                        const commentUser =

                            comment.user;


                        const commentUserId =

                            getUserId(

                                commentUser

                            );


                        const commentUserName =

                            typeof commentUser ===

                            "object"

                                ? commentUser.name ||

                                  "Unknown User"

                                : "Unknown User";


                        const isCommentOwner =

                            String(

                                commentUserId

                            ) ===

                            String(

                                currentUserId

                            );


                        postHTML += `

                            <div

                                class="comment"

                            >

                                <strong>

                                    ${commentUserName}

                                </strong>


                                <p>

                                    ${comment.text || ""}

                                </p>

                        `;


                        if (

                            isCommentOwner

                        ) {

                            postHTML += `

                                <button

                                    class="delete-comment-btn"

                                    data-post-id="${post._id}"

                                    data-comment-id="${comment._id}"

                                >

                                    🗑️ Delete

                                </button>

                            `;

                        }


                        postHTML += `

                            </div>

                        `;

                    }

                );

            }


            postHTML += `

                    </div>

                </div>

            `;


            postCard.innerHTML =

                postHTML;


            postsContainer.appendChild(

                postCard

            );

        }

    );


    addPostEvents();

}


// ==================================================
// ADD POST EVENTS
// ==================================================

function addPostEvents() {


    document

        .querySelectorAll(

            ".like-btn"

        )

        .forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        likePost(

                            button.dataset.postId

                        );

                    }

                );

            }

        );


    document

        .querySelectorAll(

            ".comment-btn"

        )

        .forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        addComment(

                            button.dataset.postId

                        );

                    }

                );

            }

        );


    document

        .querySelectorAll(

            ".delete-comment-btn"

        )

        .forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        deleteComment(

                            button.dataset.postId,

                            button.dataset.commentId

                        );

                    }

                );

            }

        );


    document

        .querySelectorAll(

            ".edit-post-btn"

        )

        .forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        editPost(

                            button.dataset.postId

                        );

                    }

                );

            }

        );


    document

        .querySelectorAll(

            ".delete-post-btn"

        )

        .forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        deletePost(

                            button.dataset.postId

                        );

                    }

                );

            }

        );

}


// ==================================================
// LIKE / UNLIKE POST
// ==================================================

async function likePost(postId) {

    if (!currentUserId) {

        alert(

            "Please login first"

        );

        return;

    }


    try {

        const response =

            await fetch(

                API_URL +

                "/posts/" +

                postId +

                "/like",

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":

                            "application/json",

                        "Authorization":

                            "Bearer " +

                            token

                    },

                    body:

                        JSON.stringify({

                            userId:

                                currentUserId

                        })

                }

            );


        const data =

            await response.json();


        if (response.ok) {

            await getPosts();

            getUnreadNotificationCount();

        }


        else {

            alert(

                data.message ||

                "Like failed"

            );

        }

    }


    catch (error) {

        console.error(

            "Like Error:",

            error

        );

    }

}


// ==================================================
// ADD COMMENT
// ==================================================

async function addComment(postId) {

    if (!currentUserId) {

        alert(

            "Please login first"

        );

        return;

    }


    const input =

        document.getElementById(

            "comment-" +

            postId

        );


    if (!input) {

        return;

    }


    const text =

        input.value.trim();


    if (!text) {

        alert(

            "Please write a comment"

        );

        return;

    }


    try {

        const response =

            await fetch(

                API_URL +

                "/posts/" +

                postId +

                "/comments",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":

                            "application/json",

                        "Authorization":

                            "Bearer " +

                            token

                    },

                    body:

                        JSON.stringify({

                            text:

                                text,

                            user:

                                currentUserId,

                            post:

                                postId

                        })

                }

            );


        const data =

            await response.json();


        if (response.ok) {

            input.value = "";

            await getPosts();

            getUnreadNotificationCount();

        }


        else {

            alert(

                data.message ||

                "Comment failed"

            );

        }

    }


    catch (error) {

        console.error(

            "Comment Error:",

            error

        );

    }

}


// ==================================================
// DELETE COMMENT
// ==================================================

async function deleteComment(

    postId,

    commentId

) {

    if (!currentUserId) {

        alert(

            "Please login first"

        );

        return;

    }


    if (

        !confirm(

            "Delete this comment?"

        )

    ) {

        return;

    }


    try {

        const response =

            await fetch(

                API_URL +

                "/posts/" +

                postId +

                "/comments/" +

                commentId,

                {

                    method: "DELETE",

                    headers: {

                        "Content-Type":

                            "application/json",

                        "Authorization":

                            "Bearer " +

                            token

                    },

                    body:

                        JSON.stringify({

                            userId:

                                currentUserId

                        })

                }

            );


        const data =

            await response.json();


        if (response.ok) {

            await getPosts();

        }


        else {

            alert(

                data.message ||

                "Delete failed"

            );

        }

    }


    catch (error) {

        console.error(

            "Delete Comment Error:",

            error

        );

    }

}


// ==================================================
// EDIT POST
// ==================================================

async function editPost(postId) {

    const newContent =

        prompt(

            "Edit your post:"

        );


    if (

        newContent === null

    ) {

        return;

    }


    const content =

        newContent.trim();


    if (!content) {

        alert(

            "Post content cannot be empty"

        );

        return;

    }


    try {

        const response =

            await fetch(

                API_URL +

                "/posts/" +

                postId,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":

                            "application/json",

                        "Authorization":

                            "Bearer " +

                            token

                    },

                    body:

                        JSON.stringify({

                            content:

                                content,

                            userId:

                                currentUserId

                        })

                }

            );


        const data =

            await response.json();


        if (response.ok) {

            await getPosts();

        }


        else {

            alert(

                data.message ||

                "Edit failed"

            );

        }

    }


    catch (error) {

        console.error(

            "Edit Post Error:",

            error

        );

    }

}


// ==================================================
// DELETE POST
// ==================================================

async function deletePost(postId) {

    if (

        !confirm(

            "Are you sure you want to delete this post?"

        )

    ) {

        return;

    }


    try {

        const response =

            await fetch(

                API_URL +

                "/posts/" +

                postId,

                {

                    method: "DELETE",

                    headers: {

                        "Content-Type":

                            "application/json",

                        "Authorization":

                            "Bearer " +

                            token

                    },

                    body:

                        JSON.stringify({

                            userId:

                                currentUserId

                        })

                }

            );


        const data =

            await response.json();


        if (response.ok) {

            await getPosts();

        }


        else {

            alert(

                data.message ||

                "Delete failed"

            );

        }

    }


    catch (error) {

        console.error(

            "Delete Post Error:",

            error

        );

    }

}


// ==================================================
// SEARCH
// ==================================================

const searchBtn =

    document.getElementById(

        "search-btn"

    );


const searchInput =

    document.getElementById(

        "search-input"

    );


if (

    searchBtn &&

    searchInput

) {

    searchBtn.addEventListener(

        "click",

        searchData

    );


    searchInput.addEventListener(

        "keypress",

        function (event) {

            if (

                event.key ===

                "Enter"

            ) {

                searchData();

            }

        }

    );

}


async function searchData() {

    const searchText =

        searchInput.value.trim();


    if (!searchText) {

        alert(

            "Please enter something to search"

        );

        return;

    }


    const resultsContainer =

        document.getElementById(

            "search-results"

        );


    if (!resultsContainer) {

        return;

    }


    resultsContainer.innerHTML =

        "Searching...";


    try {

        const response =

            await fetch(

                API_URL +

                "/search?q=" +

                encodeURIComponent(

                    searchText

                )

            );


        const data =

            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||

                "Search failed"

            );

        }


        resultsContainer.innerHTML = "";


        if (

            data.users &&

            data.users.length > 0

        ) {

            const heading =

                document.createElement(

                    "h3"

                );


            heading.textContent =

                "Users";


            resultsContainer.appendChild(

                heading

            );


            data.users.forEach(

                function (user) {

                    const userId =

                        getUserId(

                            user

                        );


                    const userDiv =

                        document.createElement(

                            "div"

                        );


                    userDiv.className =

                        "search-result";


                    userDiv.innerHTML = `

                        <a

                            href="${createProfileLink(userId)}"

                        >

                            ${

                                user.name ||

                                "Unknown User"

                            }

                        </a>


                        <p>

                            @${

                                user.username ||

                                ""

                            }

                        </p>

                    `;


                    resultsContainer.appendChild(

                        userDiv

                    );

                }

            );

        }


        if (

            data.posts &&

            data.posts.length > 0

        ) {

            const heading =

                document.createElement(

                    "h3"

                );


            heading.textContent =

                "Posts";


            resultsContainer.appendChild(

                heading

            );


            data.posts.forEach(

                function (post) {

                    const postDiv =

                        document.createElement(

                            "div"

                        );


                    postDiv.className =

                        "search-result";


                    postDiv.innerHTML = `

                        <strong>

                            ${

                                post.author?.name ||

                                "Unknown User"

                            }

                        </strong>


                        <p>

                            ${

                                post.content ||

                                ""

                            }

                        </p>

                    `;


                    resultsContainer.appendChild(

                        postDiv

                    );

                }

            );

        }


        if (

            (

                !data.users ||

                data.users.length === 0

            ) &&

            (

                !data.posts ||

                data.posts.length === 0

            )

        ) {

            resultsContainer.innerHTML =

                "<p>No results found.</p>";

        }

    }


    catch (error) {

        console.error(

            "Search Error:",

            error

        );


        resultsContainer.innerHTML =

            "<p>Search failed.</p>";

    }

}


// ==================================================
// GET UNREAD NOTIFICATION COUNT
// ==================================================

async function getUnreadNotificationCount() {

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


        const data =

            await response.json();


        const badge =

            document.getElementById(

                "notification-badge"

            );


        if (!badge) {

            return;

        }


        const count =

            data.unreadCount || 0;


        if (count > 0) {

            badge.textContent =

                count;


            badge.style.display =

                "inline-block";

        }


        else {

            badge.textContent =

                "0";


            badge.style.display =

                "none";

        }

    }


    catch (error) {

        console.error(

            "Notification Count Error:",

            error

        );

    }

}


// ==================================================
// OPEN POST FROM NOTIFICATION
// ==================================================

window.addEventListener(

    "load",

    function () {

        const postId =

            window.location.hash.replace(

                "#post-",

                ""

            );


        if (!postId) {

            return;

        }


        const postElement =

            document.getElementById(

                "post-" +

                postId

            );


        if (postElement) {

            postElement.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });


            postElement.style.border =

                "3px solid orange";


            setTimeout(

                function () {

                    postElement.style.border =

                        "";

                },

                3000

            );

        }

    }

);


// ==================================================
// INITIAL PAGE LOAD
// ==================================================

displayNavbar();

displayUser();

getPosts();

getUnreadNotificationCount();


// ==================================================
// AUTO UPDATE NOTIFICATION COUNT
// ==================================================

setInterval(

    getUnreadNotificationCount,

    10000

);