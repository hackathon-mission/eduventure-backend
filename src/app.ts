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
await client?.connect();

app.get('/', async (req, res) => {
    res.send("Hello World");
});

app.post('/login', async (req, res) => {
    const { username } = req.body;
    const db = client?.db('users');

    const user = await db?.collection('users').findOne({ username });

    if (!user) {
        res.status(404).send('User not found');
    } else {
        res.send(user._id);
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const db = client?.db('users');

    const user = await db?.collection('users').insertOne({ username });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});