# !/usr/bin/python3
# -*- coding: utf-8 -*-
import re

from common.pagination import Paginator

from fastapi import APIRouter, Request, HTTPException
from starlette.responses import RedirectResponse
from source.enums import TagRelationType, TagType, MaterialType
from source.models import TagRelation, Tag, Material
from core.settings import templates, BASE_DIR
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/t/", response_class=HTMLResponse)
@router.get("/t/{page}-{order}", response_class=HTMLResponse)
async def t_index(request: Request, cate: int = 0, tag: int = 0, order: str = 'n', page: int = 1, page_size: int = 25):
    """
    :param cate: 分类ID，0代表全部
    :param tag: 标签ID，0代表全部
    :param order: n[new]最新， d[download]下载最多
    :return:
    """

    # 获取所有材料
    queryset = TagRelation.filter(business_type=TagRelationType.MATERIAL)
    if tag and tag != 0:
        business_ids = await queryset.filter(tag_id__in=[tag]).distinct().values_list("business_id", flat=True)
        queryset = Material.filter(id__in=business_ids, is_delete=False)
    elif cate and cate != 0:
        tag_ids = await Tag.filter(business_type=TagType.material, parent_id=cate).values_list("id", flat=True)
        business_ids = await queryset.filter(tag_id__in=tag_ids).distinct().values_list("business_id", flat=True)
        queryset = Material.filter(id__in=business_ids, is_delete=False)
    else:
        queryset = Material.filter(is_delete=False)

    # 排序
    if order == "n":
        queryset = queryset.order_by("-create_time")
    elif order == 'd':
        queryset = queryset.order_by("-download_num")

    category = [{"id": t.id, "name": t.name} for t in await Tag.filter(business_type=TagType.material, parent_id=-1).all()]
    if cate and cate != '0':
        tag_list = [{"id": t.id, "name": t.name} for t in await Tag.filter(business_type=TagType.material, parent_id=cate).all()]
    else:
        tag_list = [{"id": t.id, "name": t.name} for t in await Tag.filter(business_type=TagType.material).exclude(parent_id=-1).all()]

    page_obj = await Paginator(queryset, page_size=page_size).get_page(page)
    page_range = page_obj.get_page_range()

    context = {
        "order": order,
        "tag": tag,
        "cate": cate,
        "category": category,
        "tag_list": tag_list,
        "page_obj": page_obj,
        "page_range": page_range,
    }
    return templates.TemplateResponse('t/index.html', {"request": request, **context})


@router.get("/t/onlinecode", response_class=HTMLResponse)
async def t_onlinecode(request: Request):
    return templates.TemplateResponse('t/onlinecode.html', {"request": request})


@router.get("/game/", response_class=HTMLResponse)
def game_index(request: Request):
    return templates.TemplateResponse('game/index.html', {"request": request})


@router.get("/t/{pk}", response_class=HTMLResponse)
async def game_index(request: Request, pk: int = None):
    obj = await Material.filter(id=pk).first()
    if not obj:
        return RedirectResponse(url="/404")

    await obj.viewed()
    view_more = await Material.filter(is_delete=False).order_by("-views").limit(4)

    if obj._type == MaterialType.codepen:
        obj.html_str = re.sub("</script>", "<\/script>", obj.html_str)
        context = {"request": request, "obj": obj}
        return templates.TemplateResponse('t/onlinecode.html', context)

    tag_ids = await TagRelation.filter(business_type=TagRelationType.MATERIAL, business_id=pk).values_list("tag_id", flat=True)
    tags = await Tag.filter(business_type=TagType.material, id__in=tag_ids).all()
    if tags:
        obj.tags = tags
    context = {"request": request, "obj": obj, "view_more": view_more}
    return templates.TemplateResponse('t/detail.html', context)
