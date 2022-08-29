#!/usr/bin/python
# -*- coding: utf-8 -*-
# 功能：
# 1、sitemap.xml 站点地图
# 2、缓存一周，每周更新一次
import asyncio
from datetime import datetime
import os
import abc
import requests
from functools import wraps
from typing import List

from fastapi import APIRouter
from starlette.responses import HTMLResponse
from fastapi import Request, Depends

from blog.enums import ArticleStatus
from core.settings import templates, BASE_DIR
from blog.models import Article
from source.models import Material

domain = "https://ztf.net.cn"

LANGUAGE_CODE = 'zh-hans'

router = APIRouter()


def x_robots_tag(func):
    @wraps(func)
    async def inner(request, *args, **kwargs):
        response = await func(request, *args, **kwargs)
        response.headers['X-Robots-Tag'] = 'noindex, noodp, noarchive'
        return response

    return inner


class Sitemap:
    # This limit is defined by Google. See the index documentation at
    # https://www.sitemaps.org/protocol.html#index.
    limit = 50000

    # If protocol is None, the URLs in the sitemap will use the protocol
    # with which the sitemap was requested.
    protocol = None

    # Enables generating URLs for all languages.
    i18n = False

    # Override list of languages to use.
    languages = None

    # Enables generating alternate/hreflang links.
    alternates = False

    # Add an alternate/hreflang link with value 'x-default'.
    x_default = False

    def _get(self, name, item, default=None):
        try:
            attr = getattr(self, name)
        except AttributeError:
            return default
        if callable(attr):
            return attr(item)
        return attr

    async def items(self):
        return []

    @abc.abstractmethod
    def location(self, item):
        """获取绝对URL地址 """
        pass

    async def get_urls(self):
        urls = []
        obj_list = await self.items()
        for item in obj_list:
            loc = f'{self._get("location", item)}'
            priority = self._get('priority', item)
            lastmod = self._get('lastmod', item)
            url_info = {
                'item': item,
                'location': loc,
                'lastmod': lastmod,
                'changefreq': self._get('changefreq', item),
                'priority': str(priority if priority is not None else ''),
                'alternates': [],
            }
            urls.append(url_info)
        return urls


class ArticleSiteMap(Sitemap):
    changefreq = "monthly"
    priority = "0.6"

    async def items(self):
        return await Article.filter(state=ArticleStatus.PUBLISH).all()

    def lastmod(self, obj):
        return obj.update_time.strftime('%Y-%m-%d')

    def location(self, obj):
        return f"{domain}/article/{obj.id}.html"


class MaterialSiteMap(Sitemap):
    changefreq = "monthly"
    priority = "0.6"

    async def items(self):
        return await Material.filter(is_delete=False).all()

    def lastmod(self, obj):
        return obj.update_time.strftime('%Y-%m-%d')

    def location(self, obj):
        return f"{domain}/t/{obj.id}"


class FeatureSiteMap(Sitemap):
    """网站功能模块"""
    changefreq = "Weekly"  # 可选,指定每个对象的更新频率
    priority = "0.5"  # 可选,指定每个对象的优先级,默认0.5

    async def items(self):
        return [
            {"url": "/tools/urlEncode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/unicodeEncode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/utf8Encode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/asciiEncode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/enCaseEncode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/aesEncrypt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/desEncrypt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/rc4Encrypt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/rabbitEncrypt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/md5Encrypt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/base64Encrypt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/jsformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/cssformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/htmlformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/xmlformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/sqlformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/markdownformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/jsonformat.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/uniqueText.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/countText.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/koutu.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/imgfmt.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/imgcompress.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/imgwater.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/barcode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/qrcode.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/hexconvert.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/miaobiao.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
            {"url": "/tools/timestamp.html", "update_time": datetime.strptime('2022-05-15', '%Y-%m-%d')},  # json 格式化Ò
        ]

    def lastmod(self, obj):
        return obj.get("update_time")

    def location(self, obj):
        return f"{domain}{obj.get('url')}"


sitemaps = {
    'blog': ArticleSiteMap(),
    'feature': FeatureSiteMap(),
    'material': MaterialSiteMap(),
}


def url_test(url_list: List):
    """测试URL是否可以访问"""
    error_url = []
    for u in url_list:
        res = requests.get(u.get("location"))
        print("sitemap_test:", u.get("location"))
        if res.status_code == 200:
            continue
        error_url.append(u)
    return error_url


@router.get("/sitemap.xml", response_class=HTMLResponse)
@x_robots_tag
async def sitemap(request: Request, update: str = None, test: int = 0, template_name='sitemap_template.xml', content_type='application/xml'):
    """
    :param update:  是否更新静态sitemap.xml
    :param test: 是否测试错误的URL
    :return:
    """
    # 删除静态sitemap，更新sitemap
    if not update and not test:
        if os.path.exists(os.path.join(BASE_DIR, "templates/sitemap.xml")):
            with open(os.path.join(BASE_DIR, "templates/sitemap.xml"), "r+") as f:
                return HTMLResponse(content=f.read(), media_type=content_type)

    maps = sitemaps.values()
    urls = []
    for site in maps:
        try:
            urls.extend(await site.get_urls())
        except Exception:
            raise ValueError("sitemap生成有误")

    if test:
        error_url = url_test(urls)
        template = templates.get_template(template_name)
        response = HTMLResponse(content=template.render({"request": request, "urlset": error_url}), media_type=content_type)
        return response

    template = templates.get_template(template_name)
    response = HTMLResponse(content=template.render({"request": request, "urlset": urls}), media_type=content_type)

    # 保存新的sitemap
    with open(os.path.join(BASE_DIR, "templates/sitemap.xml"), "wb") as f:
        f.write(response.body)

    return response


if __name__ == '__main__':
    pass
