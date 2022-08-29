import hashlib
import os
import time
import urllib.parse
from functools import partial
import json

import string
import random


def md5(data, block_size=65536):
    #  对于可读对象计算MD5，如：文件、request文件数据流
    m = hashlib.md5()
    # 对django中的文件对象进行迭代
    for item in iter(partial(data.read, block_size), b''):
        # 把迭代后的bytes加入到md5对象中
        m.update(item)
    str_md5 = m.hexdigest()
    return str_md5


def salt(length=4):
    data = string.ascii_letters + string.digits
    return "".join(random.sample(data, length))


# 获取原始密码+salt的md5值
def md51(salt="", pwd=""):
    """对字符串进行加密输出MD5值"""
    md5_obj = hashlib.md5()
    md5_obj.update((pwd + salt).encode("utf-8"))
    return md5_obj.hexdigest()


def decode(data: str):
    """字典数据解码"""
    return json.loads(urllib.parse.unquote(data))


def encode(data: dict):
    """字典数据编码"""
    return urllib.parse.quote(json.dumps(data))


def time_str(format="Ymdhis"):
    """格式化时间字符串"""
    if format == "Ymdhis":
        return time.strftime("%Y%m%d%H%M%S")
    elif format == 2:
        return time.strftime("%Y-%m-%d %H:%M:%S")
    elif format == "Ymd":
        return time.strftime("%Y%m%d")


def get_order_id(user_id=""):
    """获取订单ID"""
    return f"{time_str()}{random.randint(10000, 99999)}{user_id} "


def format_time(value: float):
    time_array = time.localtime(value)
    return time.strftime("%Y-%m-%d %H:%M:%S", time_array)


if __name__ == '__main__':
    print(time_str())
    print(get_order_id())
    print(salt())
