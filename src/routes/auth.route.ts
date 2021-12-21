import { Router } from "express";
import { authController } from "../controllers";

import { use } from "../helpers/utils";

const authRouter = Router();

authRouter.post("/register", use(authController.register));
authRouter.post("/login", use(authController.login));
authRouter.post("/refresh-token", use(authController.refreshAccessToken));

export default authRouter;
