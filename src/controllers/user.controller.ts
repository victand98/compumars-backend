import { Request, Response } from "express";
import { User } from "../models/User.model";

/**
 * Get all users.
 * @route GET /user/all
 */
export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find().populate("role");
  return res.status(200).json({ users });
};
