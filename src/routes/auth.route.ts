import { Router } from "express";
import { authController } from "../controllers";

import { use } from "../helpers/utils";
import { auth } from "../middlewares";

const authRouter = Router();

/**
 * GET REQUESTS
 */
authRouter.get("/current/role", auth, use(authController.currentRole));

/**
 * POST REQUESTS
 */
authRouter.post("/register", use(authController.register));
authRouter.post("/login", use(authController.login));
authRouter.post("/refresh-token", use(authController.refreshAccessToken));
authRouter.post("/logout", use(authController.logout));
authRouter.post("/confirm/account/:token", use(authController.confirmAccount));
authRouter.post(
  "/resend/confirmation",
  use(authController.resendMailConfirmation)
);

export default authRouter;
