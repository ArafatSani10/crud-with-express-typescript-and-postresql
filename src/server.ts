import express, { Request, Response } from "express";
import config from "./config";
import { pool, initDB } from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";

const app = express();

const portNumber = config.port ? parseInt(config.port as string, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', logger, (req: Request, res: Response) => {
    res.send('Hello Next Level Developers..!!')
});

app.use("/users", userRoutes);


app.use("/auth", authRoutes)







app.post('/tasks', async (req: Request, res: Response) => {
    const { user_id, title } = req.body;

    try {
        const result = await pool.query(`INSERT INTO tasks(user_id, title) VALUES($1,$2) RETURNING *`, [user_id, title]);
        res.status(201).json({
            success: true,
            message: "TASK created",
            data: result.rows[0]
        })
    }
    catch (err: any) {
        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: "Invalid user_id. User not found."
            })
        }
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
});

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

        app.listen(portNumber, () => {
            console.log(`🚀 Example app listening on port ${portNumber}`);
            console.log("Server is ready to handle requests.");
        });

    } catch (error) {
        console.error("❌ Fatal Error: Failed to initialize database or start server.");
        console.error(error);
        process.exit(1);
    }
};

startServer();