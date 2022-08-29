#!/usr/bin/python
# -*- coding: utf-8 -*-
import pickle
import json
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi_pagination import paginate, Params
from starlette.responses import RedirectResponse

from core.settings import templates, BASE_DIR

router = APIRouter()

with open(os.path.join(BASE_DIR, "data/推背图.json"), "r+", encoding="utf-8") as f:
    tuibeitu = json.load(f)

with open(os.path.join(BASE_DIR, "data/诸葛神算.json"), "r+", encoding="utf-8") as f:
    zhugeshenshu_data = json.load(f)

with open(os.path.join(BASE_DIR, "data/yijing64卦.json"), "r+", encoding="utf-8") as f:
    gua64 = json.load(f)


@router.get("/fs/tuibeitu.html", response_class=HTMLResponse)
@router.get("/fs/tuibeitu/p_{page_id}", response_class=HTMLResponse)
async def read_item(request: Request, page_id: int = 1, params: Params = Depends()):
    data = paginate(tuibeitu, params=Params(page=page_id, size=20))
    return templates.TemplateResponse("yijing/index.html", {"request": request, "data": data, "enumerate": enumerate})


@router.get("/fs/tuibeitu/{sid}.html", response_class=HTMLResponse)
async def read_item(request: Request, sid: int):
    data = paginate(tuibeitu, params=Params(page=sid + 1, size=1))
    return templates.TemplateResponse("yijing/detail.html", {"request": request, "data": data})


@router.get("/fs/yijing64.html", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("yijing/yijing64/index.html", {"request": request})


@router.get("/fs/yijing64/{sid}.html", response_class=HTMLResponse)
async def read_item(request: Request, sid: int):
    data = paginate(gua64, params=Params(page=sid, size=1))
    return templates.TemplateResponse("yijing/yijing64/detail.html", {"request": request, "data": data})


@router.get("/fs", response_class=HTMLResponse)
@router.get("/fs/zhugeshenshu.html", response_class=HTMLResponse)
async def zhugeshenshu(request: Request):
    return templates.TemplateResponse("yijing/zhouyi/zhugeshenshu.html", {"request": request})


@router.get("/fs/zhugeshenshu/{sid}.html", response_class=HTMLResponse)
async def zhugeshenshu_detail(request: Request, sid: int = 1, params: Params = Depends()):
    if 0 > sid or sid > len(zhugeshenshu_data):
        return RedirectResponse(url="/404")
    data = zhugeshenshu_data[sid]
    return templates.TemplateResponse("yijing/zhouyi/zhugeshenshuDetail.html", {"request": request, "data": data, "enumerate": enumerate})


@router.get("/fs/game.html", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("yijing/game/index.html", {"request": request})
