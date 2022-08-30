from fastapi import HTTPException, Depends
from starlette.responses import RedirectResponse
from starlette.status import HTTP_303_SEE_OTHER, HTTP_404_NOT_FOUND

from typing import List, Any
from starlette.requests import Request

from accounts.enums import UserType
from fastapi_admin.enums import Method
from fastapi_admin.resources import Action, Dropdown, Field, Link, Model, ToolbarAction
from fastapi_admin.widgets import displays, filters, inputs, Widget
from fastapi_admin.depends import get_resources
from fastapi_admin.template import templates
from fastapi_admin.app import app

from source import enums
from source.enums import TagRelationType
from source.models import Material, Tag, TagRelation, Config
from source import inputs as my_inputs
import operator


@app.register
class ConfigResource(Model):
    label = "Config"
    model = Config
    icon = "fas fa-cogs"
    filters = [
        filters.Enum(enum=enums.Status, name="status", label="Status"),
        filters.Search(name="key", label="Key", search_mode="equal"),
    ]
    fields = [
        "id",
        "label",
        "key",
        "value",
        Field(
            name="status",
            label="Status",
            input_=inputs.RadioEnum(enums.Status, default=enums.Status.on),
        ),
    ]

    async def row_attributes(self, request: Request, obj: dict) -> dict:
        if obj.get("status") == enums.Status.on:
            return {"class": "bg-green text-white"}
        return await super().row_attributes(request, obj)

    async def get_actions(self, request: Request) -> List[Action]:
        actions = await super().get_actions(request)
        switch_status = Action(
            label="Switch Status",
            icon="ti ti-toggle-left",
            name="switch_status",
            method=Method.PUT,
        )
        actions.append(switch_status)
        return actions


@app.get("/")
async def home(
        request: Request,
        resources=Depends(get_resources),
):
    return templates.TemplateResponse(
        "dashboard.html",
        context={
            "request": request,
            "resources": resources,
            "resource_label": "Dashboard",
            "page_pre_title": "overview",
            "page_title": "Dashboard",
        },
    )


@app.put("/config/switch_status/{config_id}")
async def switch_config_status(request: Request, config_id: int):
    config = await Config.get_or_none(pk=config_id)
    if not config:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND)
    config.status = not config.status
    await config.save(update_fields=["status"])
    return RedirectResponse(url=request.headers.get("referer"), status_code=HTTP_303_SEE_OTHER)


async def get_tags():
    tags = await Tag.filter(parent_id=-1, business_type=enums.TagType.material).all()


@app.register
class MaterialResource(Model):
    label = "素材"
    model = Material
    icon = "fas fa-user"
    # page_pre_title = "剧本"
    page_title = "素材"
    filters = [
        filters.Enum(
            name="_type",
            label="类型",
            enum=enums.MaterialType,
            enum_type=int,
        ),
        filters.Enum(
            name="is_delete",
            label="类型",
            enum=enums.Status,
            enum_type=int,
        ),
        filters.Search(
            name="name",
            label="名称",
            search_mode="icontains",
            placeholder="Search for name",
        ),
        # filters.Date(name="create_time", label="创建时间"),
    ]

    fields = [
        Field(
            name="name",
            label="名称",
            display=displays.Display(width="40"),
            input_=inputs.Text(default=""),
        ),
        Field(
            name="css_str",
            label="CSS",
            display=my_inputs.ListDisplay(width="40"),
            input_=inputs.TextArea(default=""),
        ),
        Field(
            name="html_str",
            label="HTML",
            display=my_inputs.ListDisplay(width="40"),
            input_=inputs.TextArea(default=""),
        ),
        Field(
            name="js_str",
            label="JS",
            display=my_inputs.ListDisplay(),
            input_=inputs.TextArea(default=""),
        ),

        Field(name="content", label="内容", display=my_inputs.ListDisplay(), input_=my_inputs.Editor()),
        "download_url",
        "download_password",

        Field(
            name="is_delete",
            label="是否发布",
            input_=inputs.RadioEnum(enums.DeleteStatus, default=enums.DeleteStatus.on),
        ),
        Field(
            name="_type",
            label="素材类型",
            input_=inputs.RadioEnum(enums.MaterialType, default=enums.MaterialType.codepen),
        ),
        Field(name="desc", label="描述", display=my_inputs.ListDisplay(), input_=my_inputs.Editor()),
        Field(
            name="category", label="分类", display=my_inputs.ListDisplay(),
            input_=my_inputs.CategoryManyToMany(model=Tag, f={"business_type": enums.TagType.material, "parent_id": -1}),
        ),
        Field(
            name="tags", label="标签", display=my_inputs.ListDisplay(),
            input_=my_inputs.TagManyToMany(model=Tag, f={"business_type": enums.TagType.material, "parent_id__not": -1}),
        ),
        Field(
            name="cover_url",
            label="封面",
            input_=my_inputs.QiniuImage(),
        ),

        "create_time",
    ]

    async def cell_attributes(self, request: Request, obj: dict, field: Field) -> dict:
        if field.name == "id":
            return {"class": "bg-danger text-white"}
        if field.name == "name":
            return {"class": "with150"}
        else:
            return {"class": "with150"}
        # return await super().cell_attributes(request, obj, field)

    async def post_save(self, request: Request, obj=None):
        """ 一级分类、二级标签、对象挂在标签下"""
        data = await request.form()
        category = data.get("category")
        new_tags = data.getlist("tags")

        # 二级标签没有改变则跳过
        old_tags_ids = await TagRelation.filter(business_id=obj.id, business_type=enums.TagRelationType.MATERIAL).values_list("tag_id", flat=True)
        old_tags = await Tag.filter(id__in=old_tags_ids, business_type=enums.TagRelationType.MATERIAL).values_list("name", flat=True)
        if operator.eq(set(new_tags), set(old_tags)):
            return

        # 更新category
        category = await Tag.filter(name=category, business_type=enums.TagType.material).first()
        if not category:
            category = await Tag.create(name=category, business_type=enums.TagType.material)

        # 更新二级标签
        await TagRelation.filter(business_id=obj.id, business_type=enums.TagRelationType.MATERIAL).delete()
        for tag_name in new_tags:
            sub_tag = await Tag.filter(name=tag_name, parent_id=category.id, business_type=enums.TagType.material).first()
            if not sub_tag:
                sub_tag = await Tag.create(name=tag_name, parent_id=category.id, business_type=enums.TagType.material)
            await TagRelation.create(tag_id=sub_tag.id, business_id=obj.id, business_type=enums.TagRelationType.MATERIAL)

    def get_queryset(self, request: Request):
        if request.state.admin:
            if request.state.admin.user_type == UserType.admin:
                return self.model.filter().all()
            else:
                return self.model.filter(id=request.state.admin.id).all()
        return RedirectResponse(url="/404")


@app.register
class TagResource(Model):
    label = "标签"
    model = Tag
    icon = "fas fa-cogs"
    filters = [
        filters.Search(name="name", label="名称", search_mode="equal"),
        filters.Search(name="parent_id", label="父标签ID", search_mode="equal"),
    ]
    fields = [
        "id",
        "name",
        "desc",
        "parent_id",
        # Field(
        #     name="parent_id", label="父标签ID", display=ListDisplay(),
        #     input_=my_inputs.ModelEnum(
        #         model=Tag, name="name", value="id",
        #         filter={"business_type": TagType.material, "parent_id": -1},
        #     ),
        # ),
        Field(
            name="business_type",
            label="business_type",
            input_=inputs.RadioEnum(enums.TagType, default=enums.TagType.material),
        ),
        "create_time"
    ]
