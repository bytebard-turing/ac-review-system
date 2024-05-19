"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoute = void 0;
const auth_controller_1 = require("./auth.controller");
const AuthRoute = (router) => {
    router.post("/api/login", auth_controller_1.AuthController.loginUser);
    router.delete("/api/logout", auth_controller_1.AuthController.logoutUser);
};
exports.AuthRoute = AuthRoute;
//# sourceMappingURL=auth.route.js.map