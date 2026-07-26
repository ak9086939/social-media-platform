const API_URL =
    "http://localhost:5000/api";


// ===============================
// GET CURRENT USER
// ===============================

const userData =
    localStorage.getItem("user");


const currentUser =
    userData
        ? JSON.parse(userData)
        : null;


// ===============================
// CHECK LOGIN
// ===============================

if (!currentUser) {

    window.location.href =
        "login.html";

}


// ===============================
// USER ID
// ===============================

const userId =
    currentUser._id;


// ===============================
// PROFILE LINK
// ===============================

document
    .getElementById(
        "profile-link"
    )
    .href =
    `profile.html?id=${userId}`;


// ===============================
// GET USER DETAILS
// ===============================

async function getUserDetails() {

    try {

        const response =
            await fetch(

                `${API_URL}/users/${userId}`

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        const user =
            data.user;


        document
            .getElementById(
                "name"
            )
            .value =
            user.name || "";


        document
            .getElementById(
                "bio"
            )
            .value =
            user.bio || "";


        document
            .getElementById(
                "profileImage"
            )
            .value =
            user.profileImage || "";


    } catch (error) {

        console.log(

            "Get User Error:",

            error

        );

    }

}


// ===============================
// UPDATE PROFILE
// ===============================

document
    .getElementById(
        "edit-profile-form"
    )
    .addEventListener(

        "submit",

        async (event) => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "name"
                    )
                    .value
                    .trim();


            const bio =
                document
                    .getElementById(
                        "bio"
                    )
                    .value
                    .trim();


            const profileImage =
                document
                    .getElementById(
                        "profileImage"
                    )
                    .value
                    .trim();


            try {

                const response =
                    await fetch(

                        `${API_URL}/users/${userId}`,

                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    bio:
                                        bio,

                                    profileImage:
                                        profileImage

                                })

                        }

                    );


                const data =
                    await response.json();


                const message =
                    document
                        .getElementById(
                            "message"
                        );


                if (response.ok) {

                    message.textContent =
                        "Profile updated successfully!";


                    message.style.color =
                        "green";


                    // Update Local Storage
                    localStorage.setItem(

                        "user",

                        JSON.stringify(
                            data.user
                        )

                    );


                    setTimeout(

                        () => {

                            window.location.href =
                                `profile.html?id=${userId}`;

                        },

                        1000

                    );

                } else {

                    message.textContent =
                        data.message ||
                        "Profile update failed";


                    message.style.color =
                        "red";

                }


            } catch (error) {

                console.log(

                    "Update Error:",

                    error

                );

            }

        }

    );


// ===============================
// PAGE LOAD
// ===============================

getUserDetails();