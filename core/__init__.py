#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import warnings
import core.log
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from tortoise import Tortoise

from core.middleware import middleware_init
from core.routers import router_init
from core.database import db_init
from core.settings import DEBUG, BASE_DIR, STATIC_DIR, DATABASE_URL

warnings.filterwarnings(
    "ignore" if True else "default",
    message="Table '.*' already exists",
    module="aiomysql.cursors"
)

models = ["accounts.models", "source.models", "blog.models"]


def conf_init(app):
    if not DEBUG:
        app.docs_url = None
        app.redoc_url = None
        app.debug = False

    # add_pagination(app)
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


async def init_fastapi_admin():
    from core.redis_pool import rediss
    from source.provider import LoginProvider
    from fastapi_admin.app import app as admin_app
    from accounts.models import Admin
    await admin_app.configure(
        logo_url="https://preview.tabler.io/static/logo-white.svg",
        template_folders=[os.path.join(BASE_DIR, "templates")],
        favicon_url="https://raw.githubusercontent.com/fastapi-admin/fastapi-admin/dev/images/favicon.png",
        providers=[
            LoginProvider(
                login_logo_url="https://preview.tabler.io/static/logo.svg",
                admin_model=Admin,
            )
        ],
        redis=rediss,
    )


async def start_event():
    # 数据库初始化
    await Tortoise.init(db_url=DATABASE_URL, modules={"models": models})
    await Tortoise.generate_schemas()

    await init_fastapi_admin()


async def shutdown_event():
    # 关闭数据库
    await Tortoise.close_connections()
    pass


def create_app():
    app = FastAPI(
        title="工具箱",
        description="工具箱接口文档",
        version="1.0.0",
        on_startup=[start_event],
        on_shutdown=[shutdown_event]
    )
    # 加载配置
    conf_init(app)

    # 初始化路由配置
    router_init(app)

    # 初始化admin
    from source import init_admin_app
    init_admin_app(app)

    # 初始化中间件
    middleware_init(app)

    # 初始化sitemap
    # from core.sitemap import sitemap_init
    # sitemap_init(app)

    return app
