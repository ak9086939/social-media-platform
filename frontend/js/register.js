const API_URL =
    "http://localhost:5000/api";


const registerForm =
    document.getElementById(
        "register-form"
    );


registerForm.addEventListener(
    "submit",

    async (event) => {

        event.preventDefault();


        const name =
            document.getElementById(
                "name"
            ).value;


        const username =
            document.getElementById(
                "username"
            ).value;


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

                    `${API_URL}/users/register`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            name: name,

                            username: username,

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

                message.textContent =
                    "Registration successful!";


                message.style.color =
                    "green";


                registerForm.reset();


                setTimeout(

                    () => {

                        window.location.href =
                            "login.html";

                    },

                    1500

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