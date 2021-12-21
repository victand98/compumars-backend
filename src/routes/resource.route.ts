import { Router } from "express";
import { resourceController } from "../controllers";

import { use } from "../helpers/utils";

const resourceRouter = Router();

resourceRouter.get("/all", use(resourceController.getResources));

export default resourceRouter;
