import { Router } from "express";
import { userController } from "../controllers";
import { RESOURCES } from "../helpers/constants";

import { use } from "../helpers/utils";
import { auth, authorize } from "../middlewares";

const userRouter = Router();

userRouter.get(
  "/all",
  auth,
  authorize(RESOURCES.USERS),
  use(userController.getUsers)
);

export default userRouter;
