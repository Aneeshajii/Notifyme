const Redis = require('ioredis');

// Connect to Redis. We use a short connection timeout so it fails gracefully locally if not installed.
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    connectTimeout: 2000,
    retryStrategy: (times) => {
        if (times > 3) {
            console.log('Redis connection failed, giving up.');
            return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
    }
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.warn('Redis is not available. Caching will be bypassed.');
});

module.exports = redis;
