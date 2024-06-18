import "dotenv/config";
import auth from './routes/auth.js'
import express from 'express';
import cors from 'cors'

import cookieParser from "cookie-parser";


const PORT = 7000;
const app = express();
app.use(cookieParser(process.env.TOKEN_SECRET))

app.use(express.json());
 app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
 }));

app.use("/api/auth", auth);

app.listen(PORT, () => {
    console.log('Server starting at '+ PORT);
});



