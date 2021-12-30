import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { MongoError } from "mongodb";
import { Error } from "mongoose";
import { CustomError } from "../helpers/customError";

export const errorHandler = (
  err: TypeError | CustomError | Error | MongoError | TokenExpiredError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = err;

  switch (err.constructor) {
    case Error.ValidationError:
      customError = handleValidationError(err as Error.ValidationError);
      break;

    case Error.CastError:
      customError = handleCastError(err as Error.CastError);
      break;

    case TokenExpiredError:
      customError = handleTokenExpiredError(err as TokenExpiredError);
      break;

    case JsonWebTokenError:
      customError = handleJsonWebTokenError(err as JsonWebTokenError);
      break;

    default:
      if ((err as MongoError).code === 11000) {
        customError = handleDuplicateKeyError(err as MongoError);
      } else if (!(err instanceof CustomError)) {
        customError = new CustomError(
          "¡Oh no! Ha ocurrido un error interno en el servidor."
        );
      }
      break;
  }

  // we are not using the next function to prvent from triggering
  // the default error-handler. However, make sure you are sending a
  // response to client to prevent memory leaks in case you decide to
  // NOT use, like in this example, the NextFunction .i.e., next(new Error())
  res.status((customError as CustomError).status).send(customError);
};

const handleValidationError = (err: Error.ValidationError): CustomError => {
  let errors = Object.values(err.errors).map((el) => el.message);
  let fields = Object.values(err.errors).map(
    (el) => (el as Error.ValidatorError).path
  );
  let fomattedMessage =
    errors.length > 1 ? errors.join(" ") : errors.toString();

  return new CustomError(fomattedMessage, 400, { fields });
};

const handleCastError = (err: Error.CastError): CustomError => {
  return new CustomError(`El valor proporcionado no es un ID válido.`, 400, {
    fields: err.path,
  });
};

const handleDuplicateKeyError = (err: any): CustomError => {
  const fields = Object.keys(err.keyValue);

  return new CustomError(`El campo ingresado ya existe.`, 409, {
    fields,
  });
};

const handleTokenExpiredError = (err: TokenExpiredError): CustomError => {
  return new CustomError(`Su sesión ha caducado y no es válida.`, 403, err);
};

const handleJsonWebTokenError = (err: JsonWebTokenError): CustomError => {
  return new CustomError(`Su sesión de usuario no es válida.`, 401, err);
};
