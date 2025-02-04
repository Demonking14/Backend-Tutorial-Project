import dotenv from "dotenv";
import Connection from "./db/Connect.js";
// import mongoose from "mongoose";

dotenv.config({
    path : "./.env"
})

Connection();
/*
different approch to connect mongodb
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`).then(() => {
            console.log(`\nMongoDB Connection Successfully on Name : ${process.env.DB_NAME}`)
        })
    } catch (error) {
        console.log("Eroor in Connection is " ,error)
    }
})()
*/