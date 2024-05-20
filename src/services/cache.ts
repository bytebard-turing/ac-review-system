import { createClient, RedisClientType } from "@redis/client";
import { getConfig } from "../utils";

let client: RedisClientType;

export const initiateConnection = async () => {
  const config = getConfig();
  client = createClient({
    url: `rediss://default:${config.redisPassword}@${config.redisServer}:${config.redisPort}`,
  });

  client.on("error", function (err) {
    throw err;
  });
  await client.connect();
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
