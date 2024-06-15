import express from 'express';
import { MongoClient } from 'mongodb';
import { configDotenv } from 'dotenv';
// dotenv init
configDotenv();
// express init
const app = express();
app.use(express.json());
// mongo init
const client = process.env.MONGO_URI ? new MongoClient(process.env.MONGO_URI) : null;
await (client === null || client === void 0 ? void 0 : client.connect());
app.get('/', async (req, res) => {
    res.send("Hello World");
});
