import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

const createUser = async (payload:Record<string, unknown>) => {
    const {name,email,password} = payload;
    const hashedPass = await bcrypt.hash(password as string, 10);
    const result = await pool.query(`INSERT INTO users(name,email,password) VALUES($1, $2, $3) RETURNING *`, [name, email,hashedPass]);

    return result
}


const getUser = async () => {
    const result = await pool.query(`SELECT * FROM users`);

    return result;
}


const getSingleUser = async (id: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

    return result;
}


const UpdateUser = async (name: string, email: string, id: string) => {
    const result = await pool.query(
        `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3 RETURNING *`,
        [name, email, id]
    );


    return result;
}


const DeleteUser = async (id: string) => {


    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);

    return result;
}

export const userServices = {
    createUser,
    getUser,
    getSingleUser,
    UpdateUser,
    DeleteUser
}