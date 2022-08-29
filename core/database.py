#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Author  : Senzhong
# @Time    : 2020/5/28 10:03
# @File    : database.py
# @Software: 这是运行在一台超级计算机上的很牛逼的Python代码

import os
from typing import Any

import redis
from pypika.utils import format_alias_sql
from tortoise.expressions import F
from core.settings import DATABASE_URL
from tortoise.contrib.fastapi import register_tortoise
from pypika.terms import Function, ArithmeticExpression


class FindInSet(Function):
    def __init__(self, field: F, expression: str):
        super().__init__("FIND_IN_SET", field, expression)


class EArithmetic(ArithmeticExpression):
    """ 数据库增加或减少，如： 收藏数量加一 """

    def get_sql(self, with_alias: bool = False, **kwargs: Any) -> str:
        """注意SQL注入风险"""
        left_op, right_op = [getattr(side, "operator", None) for side in [self.left, self.right]]

        arithmetic_sql = "{left}{operator}{right}".format(
            operator=self.operator.value,
            left=("({})" if self.left_needs_parens(self.operator, left_op) else "{}").format(
                self.left.get_sql(**kwargs)
            ),
            right=("({})" if self.right_needs_parens(self.operator, right_op) else "{}").format(
                int(self.right)
            ),
        )

        if with_alias:
            return format_alias_sql(arithmetic_sql, self.alias, **kwargs)

        return arithmetic_sql


def db_init(app):
    register_tortoise(
        app,
        db_url=DATABASE_URL,
        modules={"models": ["index.model"]},
        generate_schemas=True,
        add_exception_handlers=True,
    )
