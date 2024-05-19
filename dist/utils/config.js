"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    secret: process.env.SECRET || '',
    redisServer: process.env.REDIS_SERVER || '',
    redisPassword: process.env.REDIS_PASSWORD || '',
    redisPort: process.env.REDIS_PASSWORD || 6379,
    apiUrl: process.env.API_URL || 'http://localhost:8080'
};
//# sourceMappingURL=config.js.map