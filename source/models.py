import datetime
from typing import List

from tortoise import Model, fields, BaseDBAsyncClient
from source.enums import ProductType, Status, MaterialType, TagType, UserType, TagRelationType
from fastapi_admin.models import AbstractAdmin


class Config(Model):
    label = fields.CharField(max_length=200)
    key = fields.CharField(max_length=20, unique=True, description="Unique key for config")
    value = fields.JSONField()
    status: Status = fields.IntEnumField(Status, default=Status.on)


class Material(Model):
    id = fields.IntField(pk=True)
    user_id = fields.IntField(description="作者", default="1")
    name = fields.CharField(description="作品名称", max_length=255, default='')
    cover_url = fields.CharField(description="封面地址", max_length=500, default='')

    # yuque文章
    yuque_id = fields.CharField(description="语雀ID", max_length=255, default="")
    yuque_slug = fields.CharField(description="语雀slug", max_length=255, default="")
    content = fields.TextField(description='文章内容', default="")
    works_url = fields.CharField(description="作品地址，可以预览", max_length=500, default='')
    download_url = fields.CharField(description="下载地址", max_length=500, default='')
    download_password = fields.CharField(description="下载密码", max_length=500, default='')

    # CodePin
    css_str = fields.TextField(description='CSS内容', default="")
    html_str = fields.TextField(description='html内容', default="")
    js_str = fields.TextField(description='js内容', default="")

    desc = fields.TextField(description="描述", default='')
    download_num = fields.IntField(description="下载次数", default=0)
    views = fields.IntField(description='浏览量', default=0)
    vip = fields.BooleanField(default=False)
    is_delete = fields.BooleanField(default=False)
    _type: MaterialType = fields.IntEnumField(MaterialType, default=MaterialType.yuanma)
    origin = fields.CharField(description="来源，原创：original、转载：reprint", max_length=50, default="original")
    create_time = fields.DatetimeField(description='创建时间', auto_now_add=True)
    update_time = fields.DatetimeField(description='修改时间', auto_now_add=True)

    class Meta:
        table = "center_material"
        ordering = ['-create_time']
        verbose_name = "素材"
        verbose_name_plural = verbose_name
        get_latest_by = 'id'

    def __str__(self):
        return self.name

    async def viewed(self):
        self.views += 1
        await self.save()

    async def downloaded(self):
        self.download_num += 1
        await self.save()


class Tag(Model):
    """
    标签系统：一级标签和二级标签，parent_id=-1 为一级标签
    """
    id = fields.IntField(pk=True)
    name = fields.CharField(description='标签名称', max_length=13)
    desc = fields.CharField(description='标签描述', max_length=255, default="")
    icon = fields.CharField(description='标签描述', max_length=255, default="")
    parent_id = fields.IntField(description='父标签', default=-1)
    business_type = fields.IntEnumField(TagType, description='文件类型', default=TagType.article)
    create_time = fields.DatetimeField(description='创建时间', auto_now_add=True)
    update_time = fields.DatetimeField(description='修改时间', auto_now_add=True)

    class Meta:
        table = "blog_tag"
        ordering = ['id']

    def __str__(self):
        return self.name


class TagRelation(Model):
    """
    标签与第三方表中间表
    标签与文章关系表， 文章只使用一级标签
    标签与素材表关系
    """
    id = fields.IntField(pk=True)
    tag_id = fields.IntField(description="标签ID")
    business_id = fields.IntField(description="业务ID")
    business_type = fields.CharEnumField(TagRelationType, description="业务类型", max_length=100, default=TagRelationType.MATERIAL)
    create_time = fields.DatetimeField(description='创建时间', auto_now_add=True)
    update_time = fields.DatetimeField(description='修改时间', auto_now_add=True)

    class Meta:
        table = "blog_tagrelation"
        ordering = ['id']

    def __str__(self):
        return self.tag_id
