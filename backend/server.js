import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();    

const port = process.env.PORT || 8000;

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    Credentials: true
}))

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app;

const server = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log("Failed to start server ...",error.message);
        process.exit(1);
    }
};
server();