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
exports.CacheService = exports.initiateConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const utils_1 = require("../utils");
let client;
const initiateConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    client = new ioredis_1.default(`rediss://default:${utils_1.config.redisPassword}@${utils_1.config.redisServer}:${utils_1.config.redisPort}`);
});
exports.initiateConnection = initiateConnection;
class RawCacheService {
    set(key, value, maxAge = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield client.set(key, JSON.stringify(value));
            return result;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield client.get(key);
            return result;
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield client.del(key);
            return result;
        });
    }
}
exports.CacheService = new RawCacheService();
//# sourceMappingURL=cache.js.map