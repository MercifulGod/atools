import io
import time
from common.redis_pool import rediss


def atest_zset():
    """rediss 延迟消息测试"""
    rediss.zadd("delay-ai-session", {"111": time.time()})
    rediss.zadd("delay-ai-session", {"111": time.time() + 6})
    # rediss.zincrby("delay-ai-session", 6, "111")
    score = rediss.zscore("delay-ai-session", "111")
    rediss.zadd("delay-ai-session", {time.time() + 2: "222"}, gt=True)
    rediss.zadd("delay-ai-session", {time.time() + 3: "333"}, gt=True)
    rediss.zadd("delay-ai-session", {time.time() + 4: "444"}, gt=True)
    print(score)
    while True:
        values = rediss.zrangebyscore("delay-ai-session", 0, time.time(), start=0, num=5, withscores=True)
        if not values:
            time.sleep(0.1)
            continue
        for key, score in values:
            rediss.zrem("delay-ai-session", key)  # 从消息队列中移除该消息
            print(key, score)


def atest_list_expire():
    """必须先设置队列，再是设置过期时间，才能对整个list设置过期时间，然后一起过期"""
    rediss.lpush("seo_problem", "aa")
    rediss.expire("seo_problem", 5)
    rediss.lpush("seo_problem", "aa")
    time.sleep(6)
    rediss.lpush("seo_problem", "bb")  # 过期后创建新的list
    print(rediss.rpop("seo_problem"))  # b'bb'
    print(rediss.rpop("seo_problem"))  # None


if __name__ == "__main__":
    atest_list_expire()
