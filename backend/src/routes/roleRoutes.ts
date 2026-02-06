import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as RoleController from "../controllers/RoleController";

const roleRoutes = Router();

roleRoutes.get("/roles", isAuth, RoleController.index);
roleRoutes.get("/roles/:roleId", isAuth, RoleController.show);
roleRoutes.post("/roles", isAuth, RoleController.store);
roleRoutes.put("/roles/:roleId", isAuth, RoleController.update);
roleRoutes.delete("/roles/:roleId", isAuth, RoleController.remove);

roleRoutes.get("/permissions", isAuth, RoleController.listPermissions);

export default roleRoutes;
