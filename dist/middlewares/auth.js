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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.isAuthenticated = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils");
const services_1 = require("../services");
const authenticate = (data, exp) => __awaiter(void 0, void 0, void 0, function* () {
    const token = jsonwebtoken_1.default.sign(data, utils_1.config.secret, {
        expiresIn: exp || 86400,
        audience: utils_1.config.apiUrl,
        issuer: utils_1.config.apiUrl,
    });
    const decoded = jsonwebtoken_1.default.decode(token);
    yield services_1.CacheService.set(token, Object.assign(Object.assign({}, data), { exp: decoded.exp, iat: decoded.iat }), exp || 86400);
    return Object.assign(Object.assign({}, decoded), { token });
});
exports.authenticate = authenticate;
const isAuthenticated = (req, res, next) => {
    const token = (req.headers["Authorization"] ||
        req.headers["authorization"]);
    if (token) {
        jsonwebtoken_1.default.verify(token, utils_1.config.secret, {
            issuer: utils_1.config.apiUrl,
            audience: utils_1.config.apiUrl,
        }, (err, decoded) => {
            if (err) {
                res.status(401).json({
                    data: null,
                    message: "Invalid or missing token.",
                });
            }
            else {
                services_1.CacheService.get(token)
                    .then((result) => {
                    if (!result) {
                        res.status(401).json({
                            data: null,
                            message: "Invalid or missing token.",
                        });
                        return;
                    }
                    req.decoded = JSON.parse(result);
                    next();
                })
                    .catch((err) => {
                    res.status(401).json({
                        data: null,
                        message: "Invalid or missing token.",
                    });
                });
            }
        });
    }
    else {
        res.status(401).json({
            data: null,
            message: "Invalid or missing token.",
        });
    }
};
exports.isAuthenticated = isAuthenticated;
const logout = (token) => {
    return services_1.CacheService.remove(token);
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map