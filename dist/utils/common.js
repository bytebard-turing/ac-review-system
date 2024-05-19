"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsernameFromEmail = exports.encryptToMD5 = exports.mysql_real_escape_string = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mysql_real_escape_string = (str) => {
    return `${str}`.replace(/[^-.:@_*#/&\w\s]/g, "");
};
exports.mysql_real_escape_string = mysql_real_escape_string;
const encryptToMD5 = (text) => crypto_1.default.createHash("md5").update(text).digest("hex");
exports.encryptToMD5 = encryptToMD5;
const getUsernameFromEmail = (email) => { var _a; return !email ? "" : (_a = email.split('@')) === null || _a === void 0 ? void 0 : _a[0]; };
exports.getUsernameFromEmail = getUsernameFromEmail;
//# sourceMappingURL=common.js.map