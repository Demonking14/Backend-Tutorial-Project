import dotenv from "dotenv";
import Connection from "./db/Connect.js";

dotenv.config({
    path : "./.env"
})

Connection();