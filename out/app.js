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
app.post('/login', async (req, res) => {
    const { username } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    console.log(username);
    const user = await (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ username }));
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        res.send(user._id);
    }
});
app.post('/register', async (req, res) => {
    const { username } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const user = {
        username,
        pronouns: '',
        xp: 0,
        avatar: {
            name: '',
            img: '',
            type: ''
        },
        presented_items: []
    };
    await (db === null || db === void 0 ? void 0 : db.collection('users').insertOne({ user }));
    res.send("success");
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
