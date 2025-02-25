import dotenv from "dotenv";
import Connection from "./db/Connect.js";
import app from "./app.js";

// import mongoose from "mongoose";


/* Below is the code to config the env file so that we can use import syntax */
dotenv.config({
    path : "./.env"
})



Connection().then(()=>{
    app.listen(process.env.PORT || 3000 , ()=> {
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`)
    })
}).catch((error)=> {
    console.log("Error in Connection is " , error)
});





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