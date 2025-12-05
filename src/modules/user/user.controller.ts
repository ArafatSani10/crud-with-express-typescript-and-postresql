import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userServices } from "./user.service";


const createUser = async (req: Request, res: Response) => {
 

    try {
        const result = await userServices.createUser(req.body);
        res.status(201).json({
            success: true,
            message: "Data Inserted Successfully",
            data: result.rows[0],
        });
    }
    catch (err: any) {
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            })
        }
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};


const getUser = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getUser();
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
};

const getSingleUser = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getSingleUser(req.params.id as string);

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
};


const UpdateUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const result = await userServices.UpdateUser(name, email, req.params.id!);

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
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            })
        }
        res.status(500).json({
            success: false,
            message: err.message
        });
    };
};

const DeleteUser = async (req: Request, res: Response) => {
    try {
        const result = await userServices.DeleteUser(req.params.id!);

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
};


export const userControllers = {
    createUser,
    getUser,
    getSingleUser,
    UpdateUser,
    DeleteUser
}