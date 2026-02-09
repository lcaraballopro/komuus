import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ReservationController from "../controllers/ReservationController";
import checkPermission from "../middleware/checkPermission";

const reservationRoutes = Router();

reservationRoutes.get("/reservations", isAuth, checkPermission("reservations:view"), ReservationController.index);
reservationRoutes.post("/reservations", isAuth, checkPermission("reservations:create"), ReservationController.store);
reservationRoutes.get("/reservations/:reservationId", isAuth, checkPermission("reservations:view"), ReservationController.show);
reservationRoutes.put("/reservations/:reservationId", isAuth, checkPermission("reservations:edit"), ReservationController.update);
reservationRoutes.delete("/reservations/:reservationId", isAuth, checkPermission("reservations:delete"), ReservationController.remove);

export default reservationRoutes;
