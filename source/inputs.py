import json
from typing import Optional, Any
from tortoise import Model
from fastapi_admin.widgets.inputs import Text, File, Input, Select

from typing import Any, List, Optional, Tuple, Type
from core.qiniuUtils import get_token
from starlette.requests import Request
from fastapi_admin.widgets.displays import Display
from source import enums
from source.models import TagRelation, Tag


class QiniuImage(Input):
    template = "admin/widgets/inputs/image.html"
    input_type = "text"

    def __init__(
            self,
            help_text: Optional[str] = None,
            default: Any = None,
            null: bool = False,
            placeholder: str = "",
            disabled: bool = False,
    ):
        super().__init__(
            null=null,
            default=default,
            input_type=self.input_type,
            placeholder=placeholder,
            disabled=disabled,
            help_text=help_text,
        )

    async def render(self, request: Request, value: Any, obj: Optional[Model] = None):
        self.context["token"] = get_token()
        return await super(QiniuImage, self).render(request, value, obj)


class Editor(Text):
    template = "admin/widgets/inputs/editor.html"


class ModelEnum(Select):
    def __init__(
            self,
            model: Type[Model],
            name: str = None,
            value: Any = None,
            default: Any = None,
            filter: dict = {},
            null: bool = False,
            disabled: bool = False,
            help_text: Optional[str] = None,
    ):
        super().__init__(help_text=help_text, default=default, null=null, disabled=disabled)
        self.model = model
        self.name = name
        self.value = value
        self.filter = filter
        self.cache = {}

    async def parse_value(self, request: Request, value: Any):
        return self.cache.get(value)

    async def get_options(self):
        if not self.cache:
            self.cache = {getattr(v, self.name): getattr(v, self.value) for v in await self.get_queryset()}

        options = [(k, v) for k, v in self.cache.items()]
        if self.context.get("null"):
            options = [("", "")] + options
        return options

    async def get_queryset(self):
        return await self.model.filter(**self.filter).all()


class ManyToMany(Select):
    template = "widgets/inputs/many_to_many.html"

    def __init__(
            self,
            model: Type[Model],
            related_model: Optional[Any],
            f: dict = {},
            disabled: bool = False,
            help_text: Optional[str] = None,
            value_field: Optional[str] = "pk",
    ):
        super().__init__(help_text=help_text, disabled=disabled)
        self.model = model
        self.related_model = related_model
        self.filter = f
        self.value_field = value_field

    async def get_options(self):
        ret = await self.get_queryset()
        options = [dict(label=str(x), value=getattr(x, self.value_field)) for x in ret]
        return options

    async def get_queryset(self):
        return await self.model.filter(**self.filter).all()

    async def render(self, request: Request, value: Any, obj: Any = None):
        options = await self.get_options()
        selected = set(await self.related_model(obj) if obj else [])
        for option in options:
            if option.get("value") in selected:
                option["selected"] = True
        self.context.update(options=json.dumps(options))
        return await super(Select, self).render(request, value, obj)


class TagManyToMany(Select):
    template = "widgets/inputs/many_to_many.html"

    def __init__(
            self,
            model: Type[Model],
            f: dict = {},
            disabled: bool = False,
            help_text: Optional[str] = None,
    ):
        super().__init__(help_text=help_text, disabled=disabled)
        self.model = model
        self.filter = f

    async def get_options(self):
        tags_name = await self.model.filter(**self.filter).distinct().values_list("name", flat=True)
        options = [dict(label=name, value=name) for name in tags_name]
        return options

    async def get_select(self, obj):
        if not obj:
            return []
        tag_ids = await TagRelation.filter(business_id=obj.id,
                                           business_type=enums.TagRelationType.MATERIAL).distinct().values_list("tag_id", flat=True)

        tags_name = await Tag.filter(id__in=tag_ids).distinct().values_list("name", flat=True)
        return tags_name

    async def get_queryset(self):
        return await self.model.filter(**self.filter).all()

    async def render(self, request: Request, value: Any, obj: Any = None):
        options = await self.get_options()
        selected = await self.get_select(obj)
        for option in options:
            if option.get("value") in selected:
                option["selected"] = True
        self.context.update(options=json.dumps(options))
        return await super(Select, self).render(request, value, obj)


class CategoryManyToMany(TagManyToMany):
    template = "widgets/inputs/many_to_many.html"

    def __init__(
            self,
            model: Type[Model],
            f: dict = {},
            disabled: bool = False,
            help_text: Optional[str] = None,
    ):
        super().__init__(model, f=f, help_text=help_text, disabled=disabled)
        self.model = model

    async def get_options(self):
        tags_name = await self.model.filter(**self.filter).distinct().values_list("name", flat=True)
        options = [dict(label=name, value=name) for name in tags_name]
        return options

    async def get_select(self, obj):
        if not obj:
            return []
        tag_ids = await TagRelation.filter(business_id=obj.id,
                                           business_type=enums.TagRelationType.MATERIAL).distinct().values_list("tag_id", flat=True)
        sub_tag = await Tag.filter(id__in=tag_ids).first()
        if not sub_tag:
            return []
        category = await Tag.filter(id=sub_tag.parent_id).first()
        return [category.name] if category else []


class ListDisplay(Display):
    """修复list 页面中某个字段太长
    """

    async def render(self, request: Request, value: Any):
        if value is None:
            value = ""
        if request.url.path.endswith("list"):
            return value[:20]
        if not self.template:
            return value
        return self.templates.get_template(self.template).render(value=value, **self.context)
