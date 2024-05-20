export const getConfig = () => ({
  secret: process.env.SECRET,
  redisServer: process.env.REDIS_SERVER,
  redisPassword: process.env.REDIS_PASSWORD,
  redisPort: process.env.REDIS_PORT || 6379,
  apiUrl: process.env.API_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleServiceAccount: process.env.GCP_SERVICE_ACCOUNT_PVT_FILE,
  googleGroupEmail: process.env.GOOGLE_GROUP_EMAIL
});
