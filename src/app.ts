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
    base_adventure_id: ObjectId;
    index: number;
    completed: boolean[];
}

// helper functions

const getBaseAdventureSize = async (base_adventure_id: string): Promise<number> => {
    const db = client?.db(process.env.DB_NAME);
    const base_adventure = await db?.collection<Adventure>('adventures').findOne({ _id: ObjectId.createFromHexString(base_adventure_id) });

    console.log(base_adventure)

    if (!base_adventure) {
        return 0;
    } else {
        let size = 0;
        for (let i = 0; i < base_adventure.chapters.length; i++) {
            console.log(base_adventure.chapters[i]);
            size += base_adventure.chapters[i].links.length;
        }
        return size;
    }
}

// dotenv init

configDotenv();

// express init

const app = express();
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});


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

app.get('/adventures', async (req, res) => {
    const db = client?.db(process.env.DB_NAME);
    const adventures = await db?.collection<Adventure>('adventures').find().toArray();
    res.send(adventures);
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

app.get('/users', async (req, res) => {
    const db = client?.db(process.env.DB_NAME);
    const users = await db?.collection<User>('users').find().toArray();
    res.send(users);
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

app.delete('/adventure/:id', async (req, res) => {
    const { id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const adventure = await db?.collection<Adventure>('adventures').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!adventure) {
        res.status(404).send('Adventure not found');
    } else {
        await db?.collection<Adventure>('adventures').deleteOne({ _id: ObjectId.createFromHexString(id) });
        res.send("success");
    }
});

app.post('/user_adventure/', async (req, res) => {
    const { number: adventure_index, number: completed_index, boolean: completed, user_id } = req.body;
    const db = client?.db(process.env.DB_NAME);
    const user = await db?.collection<User>('users').findOne({ _id: ObjectId.createFromHexString(user_id) });

    if (!user) {
        res.status(404).send('User not found');
    } else {
        for (let i = 0; i < user.user_adventures.length; i++) {
            console.log("tests1");
            if (user.user_adventures[i].index == adventure_index) {
                user.user_adventures[i].completed[completed_index] = completed;
                console.log("tests");
                break;
            }
        }
        await db?.collection<User>('users').updateOne({ _id: ObjectId.createFromHexString(user_id) }, { $set: { user_adventures: user.user_adventures } });
        res.send("success");
    }
});

app.get('/adventure/:id', async (req, res) => {
    const { id } = req.params;
    const db = client?.db(process.env.DB_NAME);
    const adventure = await db?.collection<Adventure>('adventures').findOne({ _id: ObjectId.createFromHexString(id) });

    if (!adventure) {
        res.status(404).send('Adventure not found');
    } else {
        res.send(adventure);
    }
});

app.post('/make_user_adventure', async (req, res) => {
    const { user_id, base_adventure_id } = req.body;
    const db = client?.db(process.env.DB_NAME);
    const user = await db?.collection<User>('users').findOne({ _id: ObjectId.createFromHexString(user_id) });

    if (!user) {
        res.status(404).send('User not found');
    } else {
        const base_adventure_size = await getBaseAdventureSize(base_adventure_id);
        console.log(base_adventure_size);
        const user_adventure: UserAdventure = {
            base_adventure_id: ObjectId.createFromHexString(base_adventure_id),
            completed: new Array(base_adventure_size).fill(false),
            index: user.user_adventures.length
        }

        await db?.collection<User>('users').updateOne({ _id: ObjectId.createFromHexString(user_id) }, { $set: { user_adventures: [...user.user_adventures, user_adventure] } });
        res.send("success");
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