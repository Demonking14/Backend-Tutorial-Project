import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();
/*  we use app.use when we want to use any middleware or we want to configur anything in our app */
/*Now we are going to config cors for so that we can allow json , url and static files in our backend */
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))
/*Here we are configuring our json so that our backend only accept limited json not all the json*/
app.use(express.json({
    limit : "16kb"
}))
/* Similar to json we are now going to config url and static files */
app.use(express.urlencoded({
    extended : true,
    limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


// Importing router
import userRouter from './routes/user.routes.js';
app.use('/api/v1/user' , userRouter);
export default app;