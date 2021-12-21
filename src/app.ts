import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import log from "./config/logger";
import routes from "./routes";
import { errorHandler } from "./middlewares";

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

export default app;
