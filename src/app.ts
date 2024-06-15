import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { configDotenv } from 'dotenv';

// interfaces

interface User {
    _id?: ObjectId;
    username: string;
    pronouns: string;
    xp: number;
    avatar: Item | null;
    presented_items: Item[];
    user_adventures: UserAdventure[];
}

interface Item {
    _id?: ObjectId;
    name: string;
    img: string;
    type: string;
}

interface Link {
    _id?: ObjectId;
    url: string;
    name: string;
}

interface Chapter {
    _id?: ObjectId;
    links: Link[];
    description: string;
}

interface Adventure {
    _id?: ObjectId;
    chapters: Chapter[];
    description: string;
    name: string;
}

interface Teacher {
    _id?: ObjectId;
    username: string;
    realname: string;
    pronouns: string;
    avatar: string | null;
    adventures: ObjectId[];
}

interface UserAdventure {
    _id?: ObjectId;
    base_adventure: string;
    completed: boolean[];
}

// helper functions

let teacherExists = (username: string): boolean => {
    const db = client?.db(process.env.DB_NAME);
    const teacher = db?.collection<Teacher>('teachers').findOne({ username });

    return teacher ? true : false;
}

let userExists = (username: string): boolean => {
    const db = client?.db(process.env.DB_NAME);
    const user = db?.collection<User>('users').findOne({
        username
    });

    return user ? true : false;
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
    const db = client?.db(process.env.DB_NAME);

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
    const db = client?.db(process.env.DB_NAME);
    const user: User = {
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
    }

    await db?.collection<User>('users').insertOne(user);

    res.send("success");
});

app.post('/teacher/login', async (req, res) => {
    const { username } = req.body;
    const db = client?.db(process.env.DB_NAME);

    console.log(username);

    const teacher: Teacher | undefined | null = await db?.collection('teachers').findOne<Teacher>({ username });

    if (!teacher) {
        res.status(404).send('Teacher not found');
    } else {
        res.send(teacher._id);
    }
});

app.post('/teacher/adventure', async (req, res) => {
    const { teacher_id, adventure } = req.body;
    const db = client?.db(process.env.DB_NAME);
    const teacher = await db?.collection<Teacher>('teachers').findOne({ _id: ObjectId.createFromHexString(teacher_id) });

    if (!teacher) {
        res.status(404).send('Teacher not found');
    } else {
        const adventure_entry = await db?.collection<Adventure>('adventures').insertOne(adventure);
        if (!adventure_entry) {
            res.status(500).send('Error creating adventure');
        } else {
            await db?.collection<Teacher>("teachers").updateOne({ _id: ObjectId.createFromHexString(teacher_id) }, { $set: { adventures: [...teacher.adventures, adventure_entry.insertedId] } });
            res.send("success");
        }
    }
});

app.get('/teacher/adventures/:teacher_id', async (req, res) => {
    const { teacher_id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const teacher = await db?.collection<Teacher>('teachers').findOne({ _id: ObjectId.createFromHexString(teacher_id) });

    if (!teacher) {
        res.status(404).send('Teacher not found');
    } else {
        const adventures = await db?.collection<Adventure>('adventures').find({ _id: { $in: teacher.adventures } }).toArray();
        res.send(adventures);
    }
});

app.post('/teacher/register', async (req, res) => {
    const { username, realname } = req.body;
    const db = client?.db(process.env.DB_NAME);
    const teacher: Teacher = {
        username,
        realname,
        pronouns: '',
        avatar: '',
        adventures: []
    }

    await db?.collection<Teacher>('teachers').insertOne(teacher);

    res.send("success");
});

app.get('user/:id', async (req, res) => {
    const { id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const user = await db?.collection<User>('users').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!user) {
        res.status(404).send('User not found');
    } else {
        res.send(user);
    }
});

app.post('/user/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const user = await db?.collection<User>('users').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!user) {
        res.status(404).send('User not found');
    } else {
        const updatedUser = { ...user, ...req.body };
        await db?.collection<User>('users').updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: updatedUser });
        res.send(updatedUser);
    }
});

app.get('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const teacher = await db?.collection<Teacher>('teachers').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!teacher) {
        res.status(404).send('Teacher not found');
    } else {
        res.send(teacher);
    }
});

app.post('/teacher/:id', async (req, res) => {
    const { id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const teacher = await db?.collection<Teacher>('teachers').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!teacher) {
        res.status(404).send('Teacher not found');
    } else {
        const updatedTeacher = { ...teacher, ...req.body };
        await db?.collection<Teacher>('teachers').updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: updatedTeacher });
        res.send(updatedTeacher);
    }
});



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});