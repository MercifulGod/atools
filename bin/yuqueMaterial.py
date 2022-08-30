# coding=utf-8
import asyncio
import logging
import re
import sys
import os
import json

pwd = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sys.path.append(pwd)

from source.enums import MaterialType, TagType, TagRelationType
from source.models import Material, Tag, TagRelation
from common.utils import timezone_change


async def init_sucai():
    # 素材初始化
    with open(pwd + "/bin/sucai.json", "r+", encoding="utf-8") as f:
        sucai_list = json.load(f)

    # 素材页标签初始化
    data = ["网页模版", "网页素材", "网页特效", "整站源码", "小程序源码", "CodePen"]
    for item in data:
        if not await Tag.filter(name=item, business_type=TagType.material).first():
            await Tag.create(name=item, business_type=TagType.material)

    # 素材初始化
    for item in sucai_list:
        print(item.get("name", ""))
        m = await Material.filter(cover_url=item.get("preview_url")).first()
        if not await Material.filter(cover_url=item.get("preview_url")).first():
            m = await Material.create(
                user_id=1,
                cover_url=item.get("preview_url"),
                works_url=item.get("work_url"),
                download_url=item.get("download_url", ""),
                name=item.get("name", ""),
                desc=item.get("desc", ""),
                is_delete=item.get("is_delete", False),
            )
        else:
            await Material.filter(cover_url=item.get("preview_url")).update(
                name=item.get("name", ""),
                desc=item.get("desc", ""),
                is_delete=item.get("is_delete", False),
                works_url=item.get("work_url"),
                download_url=item.get("download_url", ""),
            )

        # 初始化一级标签
        category = await Tag.filter(name=item.get("category", "网页模版"), parent_id=-1, business_type=TagType.material).first()
        if not category:
            category = await Tag.create(name=item.get("category", "网页模版"), parent_id=-1, business_type=TagType.material)

        # 二级标签
        for t in item.get("tags", []):
            sub_tag = await Tag.filter(name=t).exclude(parent_id=-1).first()
            if not sub_tag:
                sub_tag = await Tag.create(name=t, parent_id=category.id, business_type=TagType.material)
            tr = await TagRelation.filter(tag_id=sub_tag.id, business_id=m.id, business_type=TagRelationType.MATERIAL).first()
            if not tr:
                await TagRelation.create(tag_id=sub_tag.id, business_id=m.id, business_type=TagRelationType.MATERIAL)


async def yuque_download_material(namespace="km8554", callback=None):
    """语雀文章更新,
    https://www.yuque.com/rookie9527/km8554/xptgfg
    https://www.yuque.com/rookie9527/:namespace/:slug

    scan:
        full: 全量扫描
        increment： 增量扫描
    """
    import requests
    docs_url = f"https://www.yuque.com/api/v2/repos/rookie9527/{namespace}/docs"
    headers = {
        'X-Auth-Token': '7wyZPD77Q29kxVPdjE3wk1kBsMXwqgXqYRhWdSUD'
    }

    # 素材初始化
    with open(pwd + "/bin/yuanma.json", "r+", encoding="utf-8") as f:
        yuanma_dict = json.load(f)

    async def update_tags(m, yuque_slug):
        """更新下载材料分类和标签,  CodePen 目前只有一个标签【写死的】"""

        category = yuanma_dict.get(yuque_slug, {}).get("category", "整站源码")
        doc_tags = yuanma_dict.get(yuque_slug, {}).get("tags", [])

        category_tag = await Tag.filter(name=category, parent_id=-1, business_type=TagType.material).first()
        if not category_tag:
            category_tag = await Tag.create(name=category, parent_id=-1, business_type=TagType.material)

        # 二级标签
        for t in doc_tags:
            sub_tag = await Tag.filter(name=t).exclude(parent_id=-1).first()
            if not sub_tag:
                sub_tag = await Tag.create(name=t, parent_id=category_tag.id, business_type=TagType.material)
            tr = await TagRelation.filter(tag_id=sub_tag.id, business_id=m.id, business_type=TagRelationType.MATERIAL).first()
            if not tr:
                await TagRelation.create(tag_id=sub_tag.id, business_id=m.id, business_type=TagRelationType.MATERIAL)

    async def insert_or_update(_id, is_update=False):
        """更具doc_id 新增或更新文章"""
        if not _id:
            return

        _response = requests.get(f"{docs_url}/{_id}", headers=headers)
        _res = _response.json()
        yuque_doc = _res.get("data", {})
        yuque_slug = yuque_doc.get("slug", "")
        content = fix_body_html_style(yuque_doc.get("body_html", ""))
        download_url = yuanma_dict.get(yuque_slug).get("download_url", "")
        download_password = yuanma_dict.get(yuque_slug).get("download_password", "")

        if is_update:
            await Material.filter(yuque_id=_id).update(
                yuque_slug=yuque_doc.get("slug", ""),
                content=content,
                cover_url=yuque_doc.get("cover", ""),
                works_url="",
                download_url=download_url,
                download_password=download_password,
                name=yuque_doc.get("title", ""),
                desc=yuque_doc.get("description", ""),
                is_delete=yuque_doc.get("is_delete", False),
                _type=MaterialType.yuanma
            )
        else:
            m = await Material.create(
                yuque_id=yuque_doc.get("id", ""),
                content=content,
                yuque_slug=yuque_doc.get("slug", ""),
                user_id=1,
                cover_url=yuque_doc.get("cover", ""),
                works_url="",
                download_url=download_url,
                download_password=download_password,
                name=yuque_doc.get("title", ""),
                desc=yuque_doc.get("description", ""),
                is_delete=yuque_doc.get("is_delete", False),
                _type=MaterialType.yuanma
            )
            return m, yuque_doc.get("slug", "")

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

    response = requests.get(docs_url, headers=headers)
    res = response.json()
    article_list = res.get("data", [])

    for i, item in enumerate(article_list):
        logging.info(f"{i}/{len(article_list)} - {item.get('title')}")
        a = await Material.filter(yuque_id=item.get("id", "")).first()

        # 空文章不发表，避免创建空文件
        if item.get("word_count") <= 0:
            if a:
                a.is_delete = False
                await a.save()
            continue

        if not item.get("public", 1):  # 没有发布的文章不更新
            if a:
                a.is_delete = True
                await a.save()
            continue

        # 文章不存在则创建
        if not a:
            m, yuque_slug = await insert_or_update(item.get("id", ""))
            await update_tags(m, yuque_slug)
            continue

        # 文章是否更新
        tmp1 = str(timezone_change(item.get("updated_at")))
        tmp2 = str(a.update_time)[:19]
        if tmp1 == tmp2:
            continue

        await insert_or_update(item.get("id", ""), is_update=True)
        await update_tags(a, item.get("slug"))


async def wapper():
    from core import DATABASE_URL
    from tortoise import Tortoise
    models = ["accounts.models", "source.models", "blog.models"]

    await Tortoise.init(db_url=DATABASE_URL, modules={"models": models})
    await init_sucai()
    await yuque_download_material()
    await Tortoise.close_connections()


if __name__ == '__main__':
    asyncio.run(wapper())
