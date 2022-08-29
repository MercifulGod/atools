import re
import time

from huey import crontab

from common.expiringdict import ExpiringDict
from common.redis_pool import rediss
from huey.contrib.djhuey import periodic_task, task, pre_execute, post_execute, on_startup, periodic_task, lock_task

EXPIRE_TIME = 60 * 60 * 2

"""
任务进度反馈，实现进度条功能
"""

HUEY_MAP = ExpiringDict(max_len=100, max_age_seconds=EXPIRE_TIME)

CLEAR_USER_LEAVE_KEY = "user_leave_key"

#
# def active_task(task=None, task_id=None):
#     # 添加task 过期监控
#     if task:
#         HUEY_MAP[task.id] = task
#         rediss.zadd(CLEAR_USER_LEAVE_KEY, {task.id: time.time() + 60})
#         return
#     # 激活task, 过期task删除
#     rediss.zadd(CLEAR_USER_LEAVE_KEY, {task_id: time.time() + 60})
#     return HUEY_MAP.get(task_id)
#
#
# @periodic_task(crontab(minute='*/3'))
# @lock_task('clear_user_leave_task')
# def clear_user_leave_task():
#     """用户离开后，清除任务"""
#     values = rediss.zrangebyscore(CLEAR_USER_LEAVE_KEY, 0, time.time(), start=0, num=5, withscores=True)
#     if not values:
#         return
#     for task_id, score in values:
#         rediss.zrem(CLEAR_USER_LEAVE_KEY, task_id)  # 从消息队列中移除该消息
#         task = HUEY_MAP.pop(task_id)
#         if task:
#             task.revoke()

# @pre_execute()
# def my_pre_execute_hook(task):
#     HUEY_MAP[task.id] = task
#     # rediss.set(f"task:{task.id}", "executing", ex=EXPIRE_TIME)
#

#
#
# @post_execute()
# def my_post_execute_hook(task, task_value, exc):
#     HUEY_MAP.pop(task.id)
#     # rediss.set(f"task:{task.id}", "finish", ex=EXPIRE_TIME)


# @on_startup()
# def open_db_connection():
#     # If for some reason the db connection appears to already be open,
#     # close it first.
#     if not db.is_closed():
#         db.close()
#     db.connect()


# @huey.signal()
# def all_signal_handler(signal, task, exc=None):
#     # This handler will be called for every signal.
#     print('%s - %s' % (signal, task.id))
#
#
# @huey.signal(SIGNAL_CANCELED, SIGNAL_COMPLETE, SIGNAL_ERROR, SIGNAL_EXPIRED, SIGNAL_LOCKED, SIGNAL_INTERRUPTED)
# def task_not_executed_handler(signal, task, exc=None):
#     # This handler will be called for the 4 signals listed, which
#     # correspond to error conditions.
#     print('[%s] %s - not executed' % (signal, task.id))
#
#
# @huey.signal(SIGNAL_COMPLETE)
# def task_success(signal, task):
#     # This handle will be called for each task that completes successfully.
#     pass
