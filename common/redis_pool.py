import redis

import logging

logger = logging.getLogger(__name__)

pool = redis.ConnectionPool(host='127.0.0.1', port=6379)
rediss = redis.Redis(connection_pool=pool)
