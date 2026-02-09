import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as TelephonyController from "../controllers/TelephonyController";

const telephonyRoutes = Router();

telephonyRoutes.post("/telephony", isAuth, TelephonyController.store);
telephonyRoutes.get("/telephony", isAuth, TelephonyController.index);
telephonyRoutes.get("/telephony/:id", isAuth, TelephonyController.show);
telephonyRoutes.put("/telephony/:id", isAuth, TelephonyController.update);
telephonyRoutes.delete("/telephony/:id", isAuth, TelephonyController.remove);
telephonyRoutes.post("/telephony/hooks/incoming", TelephonyController.handleIncomingCall);

export default telephonyRoutes;
