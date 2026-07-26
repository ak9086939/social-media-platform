const API_URL =
    "http://localhost:5000/api";


const loginForm =
    document.getElementById(
        "login-form"
    );


loginForm.addEventListener(
    "submit",

    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value;


        const password =
            document.getElementById(
                "password"
            ).value;


        try {

            const response =
                await fetch(

                    `${API_URL}/users/login`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            email: email,

                            password: password

                        })

                    }

                );


            const data =
                await response.json();


            const message =
                document.getElementById(
                    "message"
                );


            if (response.ok) {

                // JWT Token Save करें
                localStorage.setItem(
                    "token",
                    data.token
                );


                // User Data Save करें
                localStorage.setItem(

                    "user",

                    JSON.stringify(
                        data.user
                    )

                );


                message.textContent =
                    "Login successful!";


                message.style.color =
                    "green";


                setTimeout(

                    () => {

                        window.location.href =
                            "index.html";

                    },

                    1000

                );

            } else {

                message.textContent =
                    data.message;


                message.style.color =
                    "red";

            }


        } catch (error) {

            console.log(error);

            document.getElementById(
                "message"
            ).textContent =
                "Server error. Please try again.";

        }

    }

);