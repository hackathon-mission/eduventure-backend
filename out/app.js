import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { configDotenv } from 'dotenv';
// helper functions
const getBaseAdventureSize = async (base_adventure_id) => {
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const base_adventure = await (db === null || db === void 0 ? void 0 : db.collection('adventures').findOne({ _id: ObjectId.createFromHexString(base_adventure_id) }));
    if (!base_adventure) {
        return 0;
    }
    else {
        let size = 0;
        for (let i = 0; i < base_adventure.chapters.length; i++) {
            console.log(base_adventure.chapters[i]);
            size += base_adventure.chapters[i].links.length;
        }
        return size;
    }
};
// dotenv init
configDotenv();
// express init
const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
// mongo init
const client = process.env.MONGO_URI ? new MongoClient(process.env.MONGO_URI) : null;
await (client === null || client === void 0 ? void 0 : client.connect());
app.get('/', async (req, res) => {
    res.send("Hello World");
});
app.post('/login', async (req, res) => {
    const { username } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
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
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const user = {
        username,
        pronouns: '',
        xp: 0,
        avatar: {
            name: '',
            img: '',
            type: ''
        },
        presented_items: [],
        user_adventures: []
    };
    await (db === null || db === void 0 ? void 0 : db.collection('users').insertOne(user));
    res.send("success");
});
app.post('/teacher/login', async (req, res) => {
    const { username } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    console.log(username);
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ username }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        res.send(teacher._id);
    }
});
app.post('/teacher/adventure', async (req, res) => {
    const { teacher_id, adventure } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: ObjectId.createFromHexString(teacher_id) }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        const adventure_entry = await (db === null || db === void 0 ? void 0 : db.collection('adventures').insertOne(adventure));
        if (!adventure_entry) {
            res.status(500).send('Error creating adventure');
        }
        else {
            await (db === null || db === void 0 ? void 0 : db.collection("teachers").updateOne({ _id: ObjectId.createFromHexString(teacher_id) }, { $set: { adventures: [...teacher.adventures, adventure_entry.insertedId] } }));
            res.send("success");
        }
    }
});
app.get('/adventures', async (req, res) => {
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const adventures = await (db === null || db === void 0 ? void 0 : db.collection('adventures').find().toArray());
    res.send(adventures);
});
app.get('/teacher/adventures/:teacher_id', async (req, res) => {
    const { teacher_id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: ObjectId.createFromHexString(teacher_id) }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        const adventures = await (db === null || db === void 0 ? void 0 : db.collection('adventures').find({ _id: { $in: teacher.adventures } }).toArray());
        res.send(adventures);
    }
});
app.post('/teacher/register', async (req, res) => {
    const { username, realname } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const teacher = {
        username,
        realname,
        pronouns: '',
        avatar: '',
        adventures: []
    };
    await (db === null || db === void 0 ? void 0 : db.collection('teachers').insertOne(teacher));
    res.send("success");
});
app.get('/users', async (req, res) => {
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const users = await (db === null || db === void 0 ? void 0 : db.collection('users').find().toArray());
    res.send(users);
});
app.get('user/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const user = await (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        res.send(user);
    }
});
app.post('/user/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const user = await (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        const updatedUser = Object.assign(Object.assign({}, user), req.body);
        await (db === null || db === void 0 ? void 0 : db.collection('users').updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: updatedUser }));
        res.send(updatedUser);
    }
});
app.get('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        res.send(teacher);
    }
});
app.delete('/adventure/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const adventure = await (db === null || db === void 0 ? void 0 : db.collection('adventures').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!adventure) {
        res.status(404).send('Adventure not found');
    }
    else {
        await (db === null || db === void 0 ? void 0 : db.collection('adventures').deleteOne({ _id: ObjectId.createFromHexString(id) }));
        res.send("success");
    }
});
// app.post('/user_adventure/', async (req, res) => {
//     const { number: index, boolean: completed, base_adventure_id, user_id } = req.body;
//     const db = client?.db(process.env.DB_NAME);
//     const user = await db?.collection<User>('users').findOne({ _id: ObjectId.createFromHexString(user_id) });
//     if (!user) {
//         res.status(404).send('User not found');
//     } else {
//         console.log(ObjectId.createFromHexString(base_adventure_id).equals(user.user_adventures[0].base_adventure_id))
//         let user_adventure_index = -1;
//         for (let i = 0; i < user.user_adventures.length; i++) {
//             console.log(user.user_adventures[i].base_adventure_id));
// if (user.user_adventures[i].base_adventure_id.equals(ObjectId.createFromHexString(base_adventure_id))) {
//     user_adventure_index = i;
//     break;
// }
//         }
// if (user_adventure_index = -1) {
//     res.status(404).send('User adventure not found');
// } else {
//     user.user_adventures[user_adventure_index].completed[index] = completed;
//     await db?.collection<User>('users').updateOne({ _id: ObjectId.createFromHexString(user_id) }, { $set: { user_adventures: user.user_adventures } });
//     res.send("success");
// }
//     }
// });
app.get('/adventure/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const adventure = await (db === null || db === void 0 ? void 0 : db.collection('adventures').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!adventure) {
        res.status(404).send('Adventure not found');
    }
    else {
        res.send(adventure);
    }
});
app.post('/make_user_adventure', async (req, res) => {
    const { user_id, base_adventure_id } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const user = await (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: ObjectId.createFromHexString(user_id) }));
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        const base_adventure_size = await getBaseAdventureSize(base_adventure_id);
        console.log(base_adventure_size);
        const user_adventure = {
            base_adventure_id: ObjectId.createFromHexString(base_adventure_id),
            completed: new Array(base_adventure_size).fill(false)
        };
        await (db === null || db === void 0 ? void 0 : db.collection('users').updateOne({ _id: ObjectId.createFromHexString(user_id) }, { $set: { user_adventures: [...user.user_adventures, user_adventure] } }));
        res.send("success");
    }
});
app.post('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db(process.env.DB_NAME);
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        const updatedTeacher = Object.assign(Object.assign({}, teacher), req.body);
        await (db === null || db === void 0 ? void 0 : db.collection('teachers').updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: updatedTeacher }));
        res.send(updatedTeacher);
    }
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
