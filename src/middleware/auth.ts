import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

const auth = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "you are not allowed!!" });
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret as string);
            console.log({ decoded });
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};

export default auth;
