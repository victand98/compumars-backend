import { Express } from "express";
import authRouter from "./auth.route";
import resourceRouter from "./resource.route";
import roleRouter from "./role.route";
import userRouter from "./user.route";

export default (app: Express) => {
  app.use("/auth", authRouter);
  app.use("/resource", resourceRouter);
  app.use("/role", roleRouter);
  app.use("/user", userRouter);
};
