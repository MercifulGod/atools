#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Author  :
# @Time    : 2020/6/11 13:23
# @File    : __init__.py.py
# @Software: 这是运行在一台超级计算机上的很牛逼的Python代码


import logging.config

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'root': {
        'level': 'INFO',
        'handlers': ['console'],
    },
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(name)s:%(lineno)d] [%(module)s:%(funcName)s] [%(levelname)s]- %(message)s'
        },
        'verbose': {
            'format': '[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d %(module)s] %(message)s',
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            # 'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
        'null': {
            'class': 'logging.NullHandler',
        }
    },
    'loggers': {
        'fast': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True
        },
    }
}

logging.config.dictConfig(LOGGING)
