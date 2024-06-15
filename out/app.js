import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { configDotenv } from 'dotenv';
// helper functions
let teacherExists = (username) => {
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const teacher = db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ username });
    return teacher ? true : false;
};
let userExists = (username) => {
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const user = db === null || db === void 0 ? void 0 : db.collection('users').findOne({
        username
    });
    return user ? true : false;
};
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
        presented_items: [],
        user_adventures: []
    };
    await (db === null || db === void 0 ? void 0 : db.collection('users').insertOne(user));
    res.send("success");
});
app.post('/teacher/login', async (req, res) => {
    const { username } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
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
    console.log(teacher_id);
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: ObjectId.createFromHexString(teacher_id) }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        const updatedTeacher = Object.assign(Object.assign({}, teacher), { adventures: [...teacher.adventures, adventure] });
        await (db === null || db === void 0 ? void 0 : db.collection('teachers').updateOne({ _id: teacher_id }, { $set: updatedTeacher }));
        res.send(updatedTeacher);
    }
});
app.post('/teacher/adventure', async (req, res) => {
    const { teacher_id, adventure } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: teacher_id }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        const adventure_entry = await (db === null || db === void 0 ? void 0 : db.collection('adventures').insertOne(adventure));
        if (!adventure_entry) {
            res.status(500).send('Error creating adventure');
        }
        else {
            await (db === null || db === void 0 ? void 0 : db.collection("teachers").updateOne({ _id: teacher_id }, { $set: { adventures: [...teacher.adventures, adventure_entry.insertedId] } }));
            res.send("success");
        }
    }
});
// app.get('/teacher/adventure/:teacher_id/:adventure_id', async (req, res) => {
//     const { adventure_id, teacher_id } = req.params;
//     const db = client?.db('eduventure');
//     const teacher = await db?.collection<Teacher>('teachers').findOne({ _id: ObjectId.createFromHexString(teacher_id) });
//     if (!teacher) {
//         res.status(404).send('Teacher not found');
//     } else {
//         const adventure = teacher.adventures.find((adv) => adv._id === ObjectId.createFromHexString(adventure_id));
//         if (!adventure) {
//             res.status(404).send('Adventure not found');
//         } else {
//             res.send(adventure);
//         }
//     }
// });
app.post('/teacher/register', async (req, res) => {
    const { username, realname } = req.body;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
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
app.get('user/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
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
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const user = await (db === null || db === void 0 ? void 0 : db.collection('users').findOne({ _id: id }));
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        const updatedUser = Object.assign(Object.assign({}, user), req.body);
        await (db === null || db === void 0 ? void 0 : db.collection('users').updateOne({ _id: id }, { $set: updatedUser }));
        res.send(updatedUser);
    }
});
app.get('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
    const teacher = await (db === null || db === void 0 ? void 0 : db.collection('teachers').findOne({ _id: ObjectId.createFromHexString(id) }));
    if (!teacher) {
        res.status(404).send('Teacher not found');
    }
    else {
        res.send(teacher);
    }
});
app.post('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    const db = client === null || client === void 0 ? void 0 : client.db('eduventure');
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
