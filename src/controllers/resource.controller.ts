import { Request, Response } from "express";
import { Resource } from "../models/Resource.model";

/**
 * Get all resources.
 * @route GET /resource/all
 */
export const getResources = async (req: Request, res: Response) => {
  const resources = await Resource.find();
  return res.status(200).json({ resources });
};
