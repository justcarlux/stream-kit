import { NextFunction, Request, Response } from "express";
import { app } from "../app";

export async function isLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (!app.get("logged-in")) {
        return res
        .status(401)
        .json({
            message: "You need to be logged in to use this endpoint"
        });
    }
    next();
}