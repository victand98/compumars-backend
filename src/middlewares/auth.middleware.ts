import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import { CustomError } from "../helpers/customError";
import { UserDocument } from "../models/User.model";

interface DecodedUser extends JwtPayload {
  user: UserDocument;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) throw new CustomError("Se requiere autenticación.", 401);

    const jwtAccessSecret = config.get<string>("jwtAccessSecret");
    const decoded = jwt.verify(accessToken, jwtAccessSecret) as DecodedUser;

    req.user = {
      id: decoded.user._id,
      role: decoded.user.role,
    };

    next();
  } catch (error) {
    return next(error);
  }
};
