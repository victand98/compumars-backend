import { NextFunction, Request, Response } from "express";
import { CustomError } from "../helpers/customError";
import { Permission, SingleResource } from "../helpers/types";
import { Resource } from "../models/Resource.model";

export const authorize =
  (resource: SingleResource) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`req.user`, req.user);

      const foundResource = await Resource.findOne({
        slug: resource.slug,
        "roles.role": req.user.role,
      }).select({
        roles: {
          $elemMatch: {
            role: req.user.role,
          },
        },
      });

      if (!foundResource) throw new CustomError("No autorizado.", 403);

      const allow = isAllowed(foundResource?.roles[0], req.method);
      if (allow) next();
      else
        throw new CustomError(
          "Usted no tiene la autorización para acceder a este recurso.",
          403
        );
    } catch (error) {
      return next(error);
    }
  };

const isAllowed = (permissions: Permission, method: string): boolean => {
  let allow = false;

  switch (method) {
    case "GET":
      allow = permissions.read;
      break;
    case "POST":
      allow = permissions.create;
      break;
    case "PUT":
      allow = permissions.update;
      break;
    case "DELETE":
      allow = permissions.delete;
      break;
    default:
      break;
  }

  return allow;
};
