# coding=utf-8

import datetime
import logging
import re
import string
import sys
import os
import json
from urllib import parse

pwd = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sys.path.append(pwd)
from blog.models import Article
from blog.enums import ArticleStatus
from common.utils import timezone_change
from source.enums import TagRelationType
from source.models import Tag, TagRelation

import asyncio


# from tools.models import SEOSubmission

async def yuque_article(scan="full", yuque_id=None):
    """语雀文章更新
    scan:
        full: 全量扫描
        increment： 增量扫描
    """
    import requests
    docs_url = "https://www.yuque.com/api/v2/repos/rookie9527/zolq9o/docs"
    headers = {
        'X-Auth-Token': '7wyZPD77Q29kxVPdjE3wk1kBsMXwqgXqYRhWdSUD'
    }

    async def insert_or_update(_id, is_update=False):
        """更具doc_id 新增或更新文章"""
        if not _id:
            return

        _response = requests.get(f"{docs_url}/{_id}", headers=headers)
        _res = _response.json()
        cover = _res.get("data", {}).get("cover", "")
        description = _res.get("data", {}).get("description", "")
        yuque_id = _res.get("data", {}).get("id", "")
        # logging.info(_res.get("data", {}).get("title", ""))
        if is_update:
            await Article.filter(yuque_id=yuque_id).update(
                title=_res.get("data", {}).get("title", ""),
                desc=description if description else "",
                content=fix_body_html_style(_res.get("data", {}).get("body_html", "")),
                img_url=cover if cover else "",
                update_time=timezone_change(_res.get("data", {}).get("updated_at", ""))
            )
            return
        # 覆盖掉被删除的文章， 我们尽量修改文章，而不删除，避免死链的发生
        # Article.objects.filter(yuque_id=74364725).update(
        #     title=_res.get("data", {}).get("title", ""),
        #     yuque_id=_res.get("data", {}).get("id", ""),
        #     desc=description if description else "",
        #     content=fix_body_html_style(_res.get("data", {}).get("body_html", "")),
        #     img_url=cover if cover else "",
        # )
        await Article.create(
            title=_res.get("data", {}).get("title", ""),
            yuque_id=_res.get("data", {}).get("id", ""),
            desc=description if description else "",
            update_time=timezone_change(_res.get("data", {}).get("updated_at", "")),
            content=fix_body_html_style(_res.get("data", {}).get("body_html", "")),
            img_url=cover if cover else "",
        )

    async def is_show_normal(doc_id=74364725):
        """测试文章能否正常显示，分别测试语雀格式：markdown、body_html，body_lake
        经过测试：
        1、markdown格式通过python markdown模块渲染后和语雀显示不一样
        2、body_html 最佳，不需要渲染，直接显示，单需要进行一定的修复
        """
        _response = requests.get(f"{docs_url}/{doc_id}", headers=headers)
        _res = _response.json()
        body = _res.get("data", {}).get("body", "")
        body_html = _res.get("data", {}).get("body_html", "")
        body_lake = _res.get("data", {}).get("body_lake", "")

        a = await Article.filter(id=2).first()
        a.title = "body test"  # markdown文本
        a.content = body
        await a.save()
        a = await Article.filter(id=3).first()
        a.title = "body_html test"
        a.content = fix_body_html_style(body_html)
        await a.save()
        a = await Article.filter(id=4).first()
        a.title = "body_lake test"
        a.content = body_lake
        await a.save()

    def fix_body_html_style(body_html):
        # 修复table表格宽度，移动端适配： table  width => max-width
        body_html = re.sub("(<table.*?style=\")(width)", r"\1max-width", body_html)

        # 修复图片，1、图片大小，2、图片缩小放大是图片模糊
        img_style = r'\1 style="max-width:\3px;width: 100%;image-rendering: -moz-crisp-edges;image-rendering: -o-crisp-edges;image-rendering: -webkit-optimize-contrast;image-rendering: crisp-edges;-ms-interpolation-mode: nearest-neighbor;"'
        body_html = re.sub("(<img.*?)(width=\")(\d+)\"", img_style, body_html)

        # 修复图片防盗链
        body_html = body_html.replace("<img", '<img referrerpolicy="no-referrer"')

        # 修复a标签，添加nofollow， 优化SEO
        body_html = re.sub('<a(.*?)href="', r'<a\1 rel="nofollow" referrerpolicy="no-referrer" href=\"', body_html)
        return body_html

    if yuque_id:
        await insert_or_update(yuque_id, is_update=True)
        return

    response = requests.get(docs_url, headers=headers)
    res = response.json()
    article_list = res.get("data", [])

    for i, item in enumerate(article_list):
        logging.info(f"{i}/{len(article_list)} - {item.get('title')}")
        a = await Article.filter(yuque_id=item.get("id", "")).first()
        # if item.get("title") == "部署":
        #     print(1)

        # 空文章不发表，避免创建空文件
        if item.get("word_count") <= 0:
            if a:
                a.state = ArticleStatus.DRAFT
                await a.save()
            continue

        if not item.get("public", 1):  # 没有发布的文章不更新
            if a:
                a.state = ArticleStatus.DRAFT
                await a.save()
            continue

        # 文章不存在则创建
        if not a:
            await insert_or_update(item.get("id", ""))
            continue

        # 文章是否更新
        tmp1 = str(timezone_change(item.get("updated_at")))
        tmp2 = str(a.update_time)[:19]
        if tmp1 == tmp2:
            continue

        await insert_or_update(item.get("id", ""), is_update=True)

    # is_show_normal()


async def wapper():
    from core import DATABASE_URL
    from tortoise import Tortoise
    models = ["accounts.models", "source.models", "blog.models"]
    await Tortoise.init(db_url=DATABASE_URL, modules={"models": models})

    # tr_list = await TagRelation.filter().all()
    # for tr in tr_list:
    #     tag = await Tag.filter(id=tr.tag_id).first()
    #     if tag.level == -1:
    #         continue
    #     else:
    #         await TagRelation.create(tag_id=tag.id, business_id=tr.business_id, business_type=TagRelationType.MATERIAL)

    await Tag.filter(parent_id=1).update(parent_id=-1)
    # await Tag.filter(level__not=1).update(level=2)

    # await yuque_article()
    await Tortoise.close_connections()


if __name__ == '__main__':
    # yuque_article()
    # from tools.tasks import submit_bing
    # 数据库初始化

    asyncio.run(wapper())
