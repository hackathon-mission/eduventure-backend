import express from 'express';
import { MongoClient } from 'mongodb';
import { configDotenv } from 'dotenv';

// interfaces

interface User {
    _id?: string;
    username: string;
    pronouns: string;
    xp: number;
    avatar: Item | null;
    presented_items: Item[];
}

interface Item {
    _id?: string;
    name: string;
    img: string;
    type: string;
}

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

    console.log(username);

    const user: User | undefined | null = await db?.collection('users').findOne<User>({ username });

    if (!user) {
        res.status(404).send('User not found');
    } else {
        res.send(user._id);
    }
});

app.post('/register', async (req, res) => {
    const { username } = req.body;
    const db = client?.db('users');
    const user: User = {
        username,
        pronouns: '',
        xp: 0,
        avatar: {
            name: '',
            img: '',
            type: ''
        },
        presented_items: []
    }

    await db?.collection('users').insertOne({ user });

    res.send("success");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});