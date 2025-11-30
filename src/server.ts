import * as dotenv from 'dotenv';
import path from "path"
dotenv.config({ path: path.join(process.cwd(), ".env") });

import express, { Request, Response } from "express";
import { Pool } from "pg"

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectionStringValue = process.env.Connection_STR;

if (!connectionStringValue) {
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionStringValue,
});

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT false,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log("✅ Database tables (users & tasks) are ensured.");
};


app.get('/', (req: Request, res: Response) => {
    res.send('Hello Next Level Developers..!!')
});


app.post("/users", async (req: Request, res: Response) => {

    const { name, email } = req.body;

    try {
        const result = await pool.query(`INSERT INTO users(name,email) VALUES($1, $2) RETURNING *`, [name, email]);


        res.status(201).json({
            success: true,
            message: "Data Inserted Successfully",
            data: result.rows[0],
        })
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }


});

app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users`);

        res.status(200).json({
            success: true,
            message: "User recieved successfully..",
            data: result.rows,
        })
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })

    }
});

app.get("/users/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "404! User Not found..!"
            });
        }

        else {
            res.status(200).json({
                success: true,
                message: "User fetched Succesfully...!",
                data: result.rows[0],
            });
        };
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    };
});


app.put("/users/:id", async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(`UPDATE users SET name = $1, email =$2 WHERE id =$3 RETURNING *`, [name, email, req.params.id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "404! User Not found..!"
            });
        }

        else {
            res.status(200).json({
                success: true,
                message: "User Updated Succesfully...!",
                data: result.rows[0],
            });
        };
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    };
});


app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "404! User Not found..!"
            });
        }

        else {
            res.status(200).json({
                success: true,
                message: "User deleted Succesfully...!",
                data: result.rows,
            });
        };
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    };
});



app.post('/tasks', async (req: Request, res: Response) => {
    const { user_id, title } = req.body;

    try {
        // Query-তে todos এর বদলে tasks ব্যবহার করা হয়েছে
        const result = await pool.query(`INSERT INTO tasks(user_id, title) VALUES($1,$2) RETURNING *`, [user_id, title]);

        res.status(201).json({
            success: true,
            message: "TASK created",
            data: result.rows[0]
        })
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })

    }
});


// get tasks

app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM tasks`);

        res.status(200).json({
            success: true,
            message: "tasks recieved successfully..",
            data: result.rows,
        })
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })

    }
});









const startServer = async () => {
    try {
        console.log("Attempting to connect to the database...");
        await initDB();

        app.listen(port, () => {
            console.log(`🚀 Example app listening on port ${port}`);
            console.log("Server is ready to handle requests.");
        });

    } catch (error) {
        console.error("❌ Fatal Error: Failed to initialize database or start server.");
        console.error(error);
        process.exit(1);
    }
};

startServer();