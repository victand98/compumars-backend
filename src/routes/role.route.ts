import { Router } from "express";
import { roleController } from "../controllers";

import { use } from "../helpers/utils";

const roleRouter = Router();

roleRouter.get("/all", use(roleController.getRoles));

export default roleRouter;
