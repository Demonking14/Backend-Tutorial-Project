import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
/* This is the first step for backend where we have connected our backend with MongoDB 
We are using async function because database takes time to load and we have to wait for it to load*/
const Connection = async()=> {
/*Always use try and catch so that if any error occur we can handle it or see it in our terminal for debugging */
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
/* This is the end of connection code */

export default Connection;