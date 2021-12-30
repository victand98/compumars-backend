import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import log from "./config/logger";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { CustomError } from "./helpers/customError";

const app = express();

app.use(
  morgan("dev", {
    stream: { write: (message: string) => log.info(message) },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cors());

routes(app);

app.use(errorHandler);

// 404 Handler
app.use(function (req, res, next) {
  const error404 = new CustomError(
    "No se ha podido encontrar el recurso.",
    404
  );
  res.status(error404.status).json(error404);
});

export default app;
