const redis = require('redis');
const config = require('./index');

const client = redis.createClient({
  url: config.redis.url,
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('✓ Redis connected');
});

async function connectRedis() {
  await client.connect();
}

module.exports = { client, connectRedis };
