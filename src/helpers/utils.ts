import crypto from "crypto";
import config from "config";
import { NextFunction, Request, Response } from "express";
import {
  RefreshToken,
  RefreshTokenDocument,
} from "../models/RefreshToken.model";

export const use =
  (fn: (req: Request, res: Response, next?: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const hash = (input: string) =>
  crypto.createHash("sha256").update(input).digest("base64");

export const hashCompare = (firstItem: string, secondItem: string) =>
  Object.is(firstItem, secondItem);

export const generateRefreshToken = (
  user: string,
  ipAddress: string
): RefreshTokenDocument => {
  let expiredAt = new Date();
  expiredAt.setSeconds(
    expiredAt.getSeconds() + config.get<number>("jwtRefreshExpiration")
  );

  return new RefreshToken({
    user,
    token: randomTokenString(),
    expires: expiredAt.getTime(),
    createdByIp: ipAddress,
  });
};

export const randomTokenString = () => crypto.randomBytes(40).toString("hex");
