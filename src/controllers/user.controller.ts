import { Request, Response } from "express";
import { CustomRequest } from "../helpers/types";
import { hash } from "../helpers/utils";
import { User, UserDocument } from "../models/User.model";

/**
 * Get all users.
 * @route GET /user/all
 */
export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find().populate("role");
  return res.status(200).json({ users });
};

/**
 * Create new User.
 * @route POST /user/save
 */
export const saveUser = async (
  req: CustomRequest<UserDocument>,
  res: Response
) => {
  const { password, ...rest } = req.body;
  const newUser = new User({
    password: hash(password),
    ...rest,
  });
  await newUser.save();
  return res
    .status(201)
    .json({ message: "Usuario registrado con éxito.", newUser });
};
