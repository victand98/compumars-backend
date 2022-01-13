import { Response } from "express";
import config from "config";
import jwt from "jsonwebtoken";

import {
  RefreshToken,
  RefreshTokenDocument,
} from "../models/RefreshToken.model";
import {
  ActivationToken,
  ActivationTokenDocument,
} from "../models/ActivationToken.model";
import { Role } from "../models/Role.model";
import { User, UserDocument } from "../models/User.model";
import { Resource } from "../models/Resource.model";
import { ROLES } from "../helpers/constants";
import { CustomError } from "../helpers/customError";
import { CustomRequest } from "../helpers/types";
import {
  generateActivationToken,
  generateRefreshToken,
  hash,
  hashCompare,
  sendMailConfirmation,
} from "../helpers/utils";

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
      422,
      { fields: ["email"] }
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
  const activationToken = generateActivationToken(newUser.id);
  await activationToken.save();
  sendMailConfirmation(newUser, activationToken);

  return res.status(201).json({
    message: `¡Te damos la bienvenida ${newUser.firstName}!. Se ha enviado un enlace de confirmación de su cuenta a ${newUser.email}.`,
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

  if (!user.active)
    throw new CustomError(
      "Lo sentimos. Su cuenta actualmente no se encuentra activa. Si todavía no ha confirmado su cuenta, revise la bandeja de su correo donde se le ha enviado un enlace, caso contrario, comuníquese con atención al cliente.",
      403
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
 * Logout user session
 * @route POST /auth/logout
 * @param req
 * @param res
 */
export const logout = async (
  req: CustomRequest<RefreshTokenDocument>,
  res: Response
) => {
  const { token, user } = req.body;
  await RefreshToken.findOneAndRemove({ token, user });
  return res
    .status(200)
    .json({ message: "La sesión del usuario ha terminado con éxito." });
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
 * Confirm user account
 * @route POST /auth/confirm/account/:token
 * @param req
 * @param res
 */
export const confirmAccount = async (
  req: CustomRequest<ActivationTokenDocument>,
  res: Response
) => {
  const { token } = req.params;
  const activationToken = await ActivationToken.findOne({ token });
  if (!activationToken)
    throw new CustomError(
      "El enlace proporcionado para activar su cuenta no es válido.",
      404
    );
  const user = await User.findById(activationToken.user);
  if (activationToken.isExpired) {
    await activationToken.remove();
    await user?.remove();
    throw new CustomError(
      "Lo sentimos. Ha expirado el tiempo proporcionado para la confirmación de la cuenta.",
      400
    );
  }

  if (user) {
    user.active = true;
    await user.save();
  }

  // Delete the token from the database, it is no longer needed
  await activationToken.remove();

  return res.status(200).json({
    message:
      "¡Muchas gracias por confirmar la creación de tu cuenta! Ahora ya puedes iniciar sesión.",
  });
};

/**
 * Resend email for account confirmation
 * @route POST /auth/resend/confirmation
 * @param req
 * @param res
 */
export const resendMailConfirmation = async (
  req: CustomRequest<ActivationTokenDocument>,
  res: Response
) => {
  const { user } = req.body;
  const activationToken = await ActivationToken.findOne({ user }).populate(
    "user"
  );
  if (!activationToken)
    throw new CustomError(
      "No se ha podido re-enviar el correo de confirmación. Por favor, comuníquese con atención al cliente.",
      404
    );

  await activationToken.remove();
  const newActivationToken = generateActivationToken(user);
  await newActivationToken.save();
  sendMailConfirmation(activationToken.user, newActivationToken);
  return res.status(201).json({
    message: `Se ha re-enviado un enlace de confirmación de su cuenta a ${activationToken.user.email}.`,
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
