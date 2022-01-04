import config from "config";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../helpers/customError";
import { CustomRequest } from "../helpers/types";
import {
  RefreshToken,
  RefreshTokenDocument,
} from "../models/RefreshToken.model";
import { Role } from "../models/Role.model";
import { User, UserDocument } from "../models/User.model";
import { ROLES } from "../helpers/constants";
import { generateRefreshToken, hash, hashCompare } from "../helpers/utils";
import { Resource } from "../models/Resource.model";

/**
 * Register new user
 * @route POST /auth/register
 * @param req
 * @param res
 */
export const register = async (
  req: CustomRequest<UserDocument>,
  res: Response
) => {
  const user = await User.findOne({ email: req.body.email });
  if (user)
    throw new CustomError(
      `El usuario con el correo ingresado ya se encuentra registrado.`,
      422
    );

  const { password, role, ...rest } = req.body;
  let foundRole = role
    ? await Role.findById(role)
    : await Role.findOne({ slug: ROLES.USER.slug });

  const newUser = new User({
    password: hash(password),
    role: foundRole?.id,
    ...rest,
  });
  await newUser.save();

  return res.status(201).json({
    message: "Su cuenta ha sido creada con éxito.",
    user: {
      id: newUser.id,
      firstname: newUser.firstName,
      lastname: newUser.lastName,
      email: newUser.email,
    },
  });
};

/**
 * Login user
 * @route POST /auth/login
 * @param req
 * @param res
 */
export const login = async (
  req: CustomRequest<UserDocument>,
  res: Response
) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw new CustomError(
      "Las credenciales de acceso son incorrectas. Por favor, compruebe y vuelva a intentarlo.",
      404
    );

  const checkPassword = hashCompare(hash(req.body.password), user.password);
  if (!checkPassword)
    throw new CustomError(
      "Las credenciales de acceso son incorrectas. Por favor, compruebe y vuelva a intentarlo.",
      404
    );

  const jwtAccessSecret = config.get<string>("jwtAccessSecret");
  const accessToken = jwt.sign({ user }, jwtAccessSecret, {
    expiresIn: config.get<string>("jwtAccessExpiration"),
  });
  const refreshToken = generateRefreshToken(user.id, req.ip);
  await refreshToken.save();

  return res.status(200).json({
    message: "Inicio de sesión exitoso.",
    user,
    accessToken,
    refreshToken: refreshToken.token,
  });
};

/**
 * Verify and refresh access token
 * @route POST /auth/refresh-token/
 * @param req
 * @param res
 */
export const refreshAccessToken = async (
  req: CustomRequest<RefreshTokenDocument>,
  res: Response
) => {
  const { token } = req.body;
  if (!token) throw new CustomError("Se requiere autenticación.", 401);

  const refreshToken = await RefreshToken.findOne({ token }).populate(
    "user",
    "-password"
  );
  if (!refreshToken)
    throw new CustomError("Su sesión de usuario no es válida.", 401);

  if (refreshToken.isExpired) {
    await RefreshToken.findByIdAndRemove(refreshToken.id, {
      useFindAndModify: false,
    });
    throw new CustomError("Su sesión ha caducado y no es válida.", 401);
  }

  const jwtAccessSecret = config.get<string>("jwtAccessSecret");
  const newAccessToken = jwt.sign(
    { user: refreshToken.user },
    jwtAccessSecret,
    {
      expiresIn: config.get<string>("jwtAccessExpiration"),
    }
  );

  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: refreshToken.token,
  });
};

/**
 * Get current user Role and permissions
 * @route GET /auth/current/role
 * @param req
 * @param res
 */
export const currentRole = async (
  req: CustomRequest<RefreshTokenDocument>,
  res: Response
) => {
  const role = await Role.findById(req.user.role);
  const resources = await Resource.find({
    "roles.role": req.user.role,
  }).select({
    slug: 1,
    status: 1,
    roles: {
      $elemMatch: {
        role: req.user.role,
      },
    },
  });

  return res.status(200).json({ role, resources });
};
