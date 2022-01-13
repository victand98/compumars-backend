import crypto from "crypto";
import config from "config";
import { NextFunction, Request, Response } from "express";
import {
  RefreshToken,
  RefreshTokenDocument,
} from "../models/RefreshToken.model";
import {
  ActivationToken,
  ActivationTokenDocument,
} from "../models/ActivationToken.model";
import { promises as fs } from "fs";
import { UserDocument } from "../models/User.model";
import path from "path";
import handlebars from "handlebars";
import { sendMail } from "../config/email";

// Function that wraps an Express controller function, capturing the error and sending it to the default error handler.
export const use =
  (fn: (req: Request, res: Response, next?: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const hash = (input: string) =>
  crypto.createHash("sha256").update(input).digest("base64");

export const hashCompare = (firstItem: string, secondItem: string) =>
  Object.is(firstItem, secondItem);

// Function that generates a new access token using a valid refresh token
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

// A function that generates a new activation token for a particular account.
export const generateActivationToken = (
  user: string
): ActivationTokenDocument => {
  let expiredAt = new Date();
  expiredAt.setHours(
    expiredAt.getHours() + config.get<number>("activationTokenExpiration")
  );

  return new ActivationToken({
    user,
    token: randomTokenString(),
    expires: expiredAt.getTime(),
  });
};

// Function that creates a random token using crypto library
export const randomTokenString = () => crypto.randomBytes(40).toString("hex");

// Function that allows to read a file from the system
export const readFile = (path: string) =>
  fs.readFile(path, { encoding: "utf-8" });

// Function for sending a confirmation email to the user
export const sendMailConfirmation = async (
  user: UserDocument,
  activationToken: ActivationTokenDocument
) => {
  try {
    const htmlTemplatePath = path.join(
      __dirname,
      "..",
      "public",
      "templates",
      "confirmEmail.html"
    );
    const htmlTemplate = await readFile(htmlTemplatePath);
    const template = handlebars.compile(htmlTemplate);
    const replacements = {
      firstName: user.firstName,
      token: activationToken.token,
      expires: new Date(activationToken.expires),
      frontendUri: config.get<string>("frontendUri"),
      actionType: "Confirmar correo electrónico",
    };
    const htmlToSend = template(replacements);
    await sendMail({
      to: user.email,
      html: htmlToSend,
    });
  } catch (error) {
    console.error(error);
  }
};
