"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const middlewares_1 = require("../../middlewares");
const google_auth_library_1 = require("google-auth-library");
class RawAuthController extends google_auth_library_1.OAuth2Client {
    constructor() {
        super();
        this.loginUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { credentialResponse } = req.body;
            if (!credentialResponse) {
                next({
                    statusCode: 400,
                    message: "access token must be provied",
                });
                return;
            }
            const { payload } = (yield this.verifyIdToken({
                idToken: credentialResponse.credential,
                audience: credentialResponse.client_id,
            }));
            const { exp, name, email, jti } = payload;
            const result = yield (0, middlewares_1.authenticate)({ name, email, jti }, exp);
            res.status(200).json({
                data: Object.assign(Object.assign({}, payload), result),
                message: "User has logged in successfully.",
            });
            next();
        });
        this.logoutUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const token = req.headers["authorization"];
            const result = yield (0, middlewares_1.logout)(token);
            if (!result) {
                res.status(400).json({
                    data: null,
                    message: "Bad request.",
                });
                return;
            }
            res.status(200).json({
                data: result,
                message: "User has been logged out successfully.",
            });
            next();
        });
    }
}
exports.AuthController = new RawAuthController();
//# sourceMappingURL=auth.controller.js.map