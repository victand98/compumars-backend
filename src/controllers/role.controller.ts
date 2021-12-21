import { Request, Response } from "express";
import { Role } from "../models/Role.model";

/**
 * Get all roles.
 * @route GET /role/all
 */
export const getRoles = async (req: Request, res: Response) => {
  const roles = await Role.find();
  return res.status(200).json({ roles });
};
