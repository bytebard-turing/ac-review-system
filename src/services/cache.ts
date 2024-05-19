import Redis from "ioredis";
import { config } from "../utils";

let client: Redis.Redis;

export const initiateConnection = async () => {
  client = new Redis(
    `rediss://default:${config.redisPassword}@${config.redisServer}:${config.redisPort}`
  );
};

class RawCacheService {
  async set(key: string, value: Object, maxAge: number = 0) {
    const result = await client.set(key, JSON.stringify(value));
    return result;
  }
  async get(key: string) {
    const result = await client.get(key);
    return result;
  }
  async remove(key: string) {
    const result = await client.del(key);
    return result;
  }
}
export const CacheService = new RawCacheService();
