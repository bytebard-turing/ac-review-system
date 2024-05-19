import Redis from "ioredis";
import { config } from "../utils";

let client: Redis;
export const initiateConnection = async () => {
  client = new Redis(`rediss://default:${config.redisPassword}@${config.redisServer}:${config.redisPort}`);

  client.on("error", (err) => {
    console.error("Redis Error:: ", err);
  });

  client.on("connect", () => {
    console.error("Redis connected successfully");
  });
  await client.connect();
  return Promise.resolve()
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
