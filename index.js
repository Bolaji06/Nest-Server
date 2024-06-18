import "dotenv/config";
import auth from './routes/auth.js'
import express from 'express';
import cors from 'cors'

import cookieParser from "cookie-parser";


const PORT = 7000;
const app = express();
app.use(cookieParser(process.env.TOKEN_SECRET))

app.use(express.json());

const allowedOrigins = [process.env.DEV_CORS_URL, process.env.PROD_CORS_URL];
app.use(cors({
    origin: function (origin, callback){
        if (!origin || allowedOrigins.indexOf(origin) !== -1){
            callback(null, true);
        }else {
            callback(new Error('CORS not allowed'))
        }
    },
    credentials: true,
 }));

app.use("/api/auth", auth);
app.get('/', (req, res) => {
    res.send('Welcome to the homepage')
})

app.listen(PORT, () => {
    console.log('Server starting at '+ PORT);
});



