import { config } from "dotenv";
config();
import express from 'express';
import connectDB from "./db/db.js";
import { userRouter } from "./controller/user.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('upload'));


// Routers
app.use("/user", userRouter)

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`SERVER IS RUNING PORT ${process.env.PORT}`);
})