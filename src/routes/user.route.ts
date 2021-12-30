import { Router } from "express";
import { userController } from "../controllers";
import { RESOURCES } from "../helpers/constants";

import { use } from "../helpers/utils";
import { auth, authorize } from "../middlewares";

const userRouter = Router();

/**
 * GET REQUESTS
 */
userRouter.get(
  "/all",
  auth,
  authorize(RESOURCES.USERS),
  use(userController.getUsers)
);

/**
 * POST REQUESTS
 */
userRouter.post(
  "/save",
  auth,
  authorize(RESOURCES.USERS),
  use(userController.saveUser)
);

export default userRouter;
