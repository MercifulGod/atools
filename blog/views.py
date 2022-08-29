# !/usr/bin/python3
# -*- coding: utf-8 -*-
from common.pagination import Paginator

from fastapi import APIRouter, Request, HTTPException
from starlette.responses import RedirectResponse
from blog.enums import ArticleStatus
from blog.models import Article
from source.enums import TagRelationType, TagType
from source.models import TagRelation, Tag, Material
from core.settings import templates, BASE_DIR
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    # 最新
    news_list = await Material.filter(is_delete=False).order_by("-create_time").limit(8)

    # 观看最多
    views_list = await Material.filter(is_delete=False).order_by("-views").limit(8)

    for item in news_list + views_list:
        tag_ids = await TagRelation.filter(business_type=TagRelationType.MATERIAL, business_id=item.id).values_list("tag_id", flat=True)
        tags = await Tag.filter(business_type=TagType.material, id__in=tag_ids).all()
        if tags:
            item.tags = tags
        item.name.replace("CodePin-", "")

    context = {"news_list": news_list, "views_list": views_list}
    return templates.TemplateResponse('index.html', {"request": request, **context})


@router.get("/article", response_class=HTMLResponse)
async def article_list(request: Request, tag_id: str = None, page: int = 1, page_size: int = 25):
    if tag_id:
        article_ids = await TagRelation.filter(
            business_type=TagRelationType.ARTICLE,
            business_id=tag_id
        ).values_list("business_id", flat=True)
        articles = Article.filter(state=ArticleStatus.PUBLISH, id__in=article_ids)
    else:
        articles = Article.filter(state=ArticleStatus.PUBLISH)

    page = await Paginator(articles, page_size=page_size).get_page(page)
    page_range = page.get_page_range()

    # 最新
    new_article = await Article.filter(state=ArticleStatus.PUBLISH).order_by("-update_time").limit(10)
    # 最热门
    hot_article = await Article.filter(state=ArticleStatus.PUBLISH).order_by("-views").limit(10)
    tags = await Tag.filter(business_type=TagType.article).all()

    context = {
        "new_article": new_article,
        "hot_article": hot_article,
        "tags": tags,
        "page_obj": page,
        "page_range": page_range,
    }
    return templates.TemplateResponse('article/index.html', {"request": request, **context})


@router.get("/article/{article_id}.html", response_class=HTMLResponse)
async def article_detail(request: Request, article_id: str = "1"):
    article = await Article.filter(id=article_id).first()
    if not article:
        return RedirectResponse(url="/404")
    # 最新
    new_article = await Article.filter(state=ArticleStatus.PUBLISH).order_by("-update_time").limit(10)
    # 最热门
    hot_article = await Article.filter(state=ArticleStatus.PUBLISH).order_by("-views").limit(10)
    tags = await Tag.filter(business_type=TagType.article).all()

    # if not article.yuque_id:
    #     # markdown转HTML
    #     article.content = markdown.markdown(article.content, extensions=[
    #         'markdown.extensions.extra',
    #         'markdown.extensions.codehilite',
    #         'markdown.extensions.toc',
    #     ])

    context = {
        "article": article,
        "next_article": await article.next_article(),
        "prev_article": await article.prev_article(),
        "new_article": new_article,
        "hot_article": hot_article,
        "tags": tags,
    }
    await article.viewed()  # todo 在URL加上缓存后，无法加一
    return templates.TemplateResponse('article/detail.html', {"request": request, **context})


@router.get("/Demo.html", response_class=HTMLResponse)
async def article_detail(request: Request):
    return templates.TemplateResponse('Demo.html', {"request": request})
