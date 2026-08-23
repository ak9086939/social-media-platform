const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/search",searchRoutes);
app.use("/api/notifications",notificationRoutes);

app.get("/", (req, res) => {
    res.send(
        "Social Media Platform API is Running 🚀"
    );
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully ✅");
        app.listen(
            process.env.PORT,
            () => {
                console.log(`Server running on port ${process.env.PORT} 🚀`);
            }
        );
    })

    .catch((error) => {
        console.log("MongoDB Connection Error ❌");
        console.log(error);
    });
