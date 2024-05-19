"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const middlewares_1 = require("../middlewares");
const auth_route_1 = require("../api/auth/auth.route");
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const express_content_length_validator_1 = __importDefault(require("express-content-length-validator"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const utils_1 = require("../utils");
const code_edit_sample_route_1 = require("../api/code-edit-sample/code-edit-sample.route");
const init = (router, app) => {
    app.use((0, compression_1.default)());
    app.use(body_parser_1.default.urlencoded({
        limit: "200mb",
        extended: true,
        parameterLimit: 5000,
    }));
    app.use(body_parser_1.default.json({ limit: "200mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_content_length_validator_1.default.validateMax({ max: 5000 }));
    // session cookie setup
    app.use((0, cookie_session_1.default)({
        name: "session",
        keys: [utils_1.config.secret],
        // Cookie Options
        maxAge: 86400, // 24 hours
    }));
    // cors options
    const corsOptions = {
        credentials: true,
        optionsSuccessStatus: 200,
    };
    router.use("/api/*", (0, cors_1.default)(corsOptions), (req, res, next) => {
        next();
    });
    // helmet for route protection
    app.use((0, helmet_1.default)());
    router.use("/api/logout", middlewares_1.isAuthenticated);
    router.use("/api/code-samples*", middlewares_1.isAuthenticated);
    (0, auth_route_1.AuthRoute)(router);
    (0, code_edit_sample_route_1.CodeSampleRouter)(router);
    app.use("/", router);
};
exports.init = init;
//# sourceMappingURL=index.js.map