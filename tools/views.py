# !/usr/bin/python3
# -*- coding: utf-8 -*-

from fastapi import APIRouter, Request
from core.settings import templates, BASE_DIR
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/tools/web_nav.html", response_class=HTMLResponse)
async def stamp(request: Request):
    return templates.TemplateResponse('tools/other/web_nav.html', {"request": request})


@router.get("/tools/screen-record.html", response_class=HTMLResponse)
async def stamp(request: Request):
    return templates.TemplateResponse('tools/other/screen-record.html', {"request": request})


@router.get("/tools/yinzhang.html", response_class=HTMLResponse)
async def stamp(request: Request):
    return templates.TemplateResponse('tools/other/yinzhang.html', {"request": request})


@router.get("/tools/pintu.html", response_class=HTMLResponse)
async def pintu(request: Request):
    return templates.TemplateResponse('tools/image/pintu.html', {"request": request})


@router.get("/tools/koutu.html", response_class=HTMLResponse)
async def koutu(request: Request):
    return templates.TemplateResponse('tools/image/koutu.html', {"request": request})


@router.get("/tools/imgWaterRemove.html", response_class=HTMLResponse)
async def image_water_remove(request: Request):
    headers = {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp"
    }
    response = templates.TemplateResponse(f'water/image.html', {"request": request}, headers=headers)
    return response


@router.get("/tools/imgWaterInnerRemove.html", response_class=HTMLResponse)
async def image_water_inner_remove(request: Request):
    headers = {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp"
    }
    response = templates.TemplateResponse(f'water/imageInner.html', {"request": request}, headers=headers)
    return response


@router.get("/tools/{html_name}.html", response_class=HTMLResponse)
async def render_html(request: Request, html_name: str = ""):
    if html_name.lower().startswith("img"):
        return templates.TemplateResponse(f'tools/image/{html_name}.html', {"request": request})
    if html_name.lower().startswith("site"):
        return templates.TemplateResponse(f'tools/site/{html_name}.html', {"request": request})
    if "encrypt" in html_name.lower():
        return templates.TemplateResponse(f'tools/encrypt/{html_name}.html', {"request": request})
    if "format" in html_name.lower():
        return templates.TemplateResponse(f'tools/format/{html_name}.html', {"request": request})
    if "text" in html_name.lower():
        return templates.TemplateResponse(f'tools/text/{html_name}.html', {"request": request})
    if "encode" in html_name.lower():
        return templates.TemplateResponse(f'tools/encode/{html_name}.html', {"request": request})
    if "code" in html_name.lower():
        return templates.TemplateResponse(f'tools/code/{html_name}.html', {"request": request})
    return templates.TemplateResponse(f'tools/other/{html_name}.html', {"request": request})


@router.get("/tools/water/{html_name}.html", response_class=HTMLResponse)
async def water_render_html(request: Request, html_name: str):
    headers = {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp"
    }
    response = templates.TemplateResponse(f'water/{html_name}.html', {"request": request}, headers=headers)
    # 跨域支持
    # response["Access-Control-Allow-Origin"] = "*"
    # response["Cross-Origin-Resource-Policy"] = "cross-origin"
    # response["Access-Control-Allow-Methods"] = "POST,GET,PUT,DELETE"
    # response["Access-Control-Allow-Headers"] = "*"
    # response["Access-Control-Allow-Credentials"] = "true"
    #  <meta name='Cross-Origin-Resource-Policy' content='cross-origin'/>
    return response
