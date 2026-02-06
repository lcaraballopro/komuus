import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CloseReasonController from "../controllers/CloseReasonController";

const closeReasonRoutes = Router();

closeReasonRoutes.get("/close-reasons", isAuth, CloseReasonController.index);
closeReasonRoutes.post("/close-reasons", isAuth, CloseReasonController.store);
closeReasonRoutes.get("/close-reasons/:closeReasonId", isAuth, CloseReasonController.show);
closeReasonRoutes.put("/close-reasons/:closeReasonId", isAuth, CloseReasonController.update);
closeReasonRoutes.delete("/close-reasons/:closeReasonId", isAuth, CloseReasonController.remove);

export default closeReasonRoutes;
