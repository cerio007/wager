const Redis = require(`ioredis`);
const redisUri = process.env.REDIS_URI;

const redisClient = new Redis(redisUri);

redisClient.on(`connect`, () => {
  console.log(`Connected to Redis database!`);
});

redisClient.on(`error`, (err) => {
  console.error(`Redis connection error:`, err);
});

redisClient.on(`ready`, () => {
  console.log(`Redis client is ready to accept commands.`);
});

module.exports = redisClient;
