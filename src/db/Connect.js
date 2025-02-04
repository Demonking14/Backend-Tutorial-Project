import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const Connection = async()=> {
    try{
        const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`).then(()=> {
            console.log(`\nMongoDB Connection Successfully on Name : ${ConnectionInstance.connection.host}` )
        })    }
    catch{
        (error)=>{
            console.log("MongoDB Connection Error" , error)
            process.exit(1);

        }
    }
}

export default Connection;