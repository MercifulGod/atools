import aioredis
# import redis
import os
import logging

logger = logging.getLogger(__name__)

# pool = redis.ConnectionPool(host='127.0.0.1', port=6379)
# rediss = redis.Redis(connection_pool=pool)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
rediss = aioredis.from_url(REDIS_URL, decode_responses=True, encoding="utf8")
