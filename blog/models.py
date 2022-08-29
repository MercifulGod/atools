import logging
from tortoise import Model, fields
from blog.enums import ArticleStatus, FileType

logger = logging.getLogger(__name__)


class Comment(Model):
    """
    评论系统
    """
    id = fields.IntField(pk=True)
    content = fields.TextField(description='正文', max_length=300)
    from_user_id = fields.IntField(description='用户ID')
    to_user_id = fields.IntField(description='用户ID')
    article_id = fields.IntField(description='文章ID')
    parent_comment = fields.IntField(description='上级评论', default="-1")
    create_time = fields.DatetimeField(description='创建时间', auto_now_add=True)
    update_time = fields.DatetimeField(description='修改时间', auto_now_add=True)

    class Meta:
        table = "blog_comment"
        ordering = ['id']

    def __str__(self):
        return self.id

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class Article(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(description='文章标题', max_length=255, default="")
    user_id = fields.IntField(description='用户ID', default=1)
    yuque_id = fields.CharField(description='语雀ID', max_length=255, default=0)
    desc = fields.TextField(description='文章描述')
    img_url = fields.CharField(description="封面地址", max_length=500, default='')
    content = fields.TextField(description='文章内容')
    state = fields.IntEnumField(ArticleStatus, description='文章发布状态', default=ArticleStatus.PUBLISH)
    views = fields.IntField(description='浏览量', default=0)
    create_time = fields.DatetimeField(description='创建时间', auto_now_add=True)
    update_time = fields.DatetimeField(description='修改时间', auto_now_add=True)

    class Meta:
        table = "blog_article"
        ordering = ['id']

    def __str__(self):
        return self.title

    async def viewed(self):
        self.views += 1
        await self.save()

    async def next_article(self):
        # 下一篇
        return await Article.filter(id__gt=self.id).order_by('id').first()

    async def prev_article(self):
        # 前一篇
        return await Article.filter(id__lt=self.id).order_by('id').first()


class Attachments(Model):
    """
    附件表
    """

    id = fields.IntField(pk=True)
    name = fields.CharField(description='文件名称', max_length=255, default="")
    size = fields.CharField(description='文件大小', max_length=255, default="0")
    md5 = fields.CharField(description='文件MD5', max_length=255, default="")
    file = fields.CharField(description='文件', default="", max_length=500)
    business_id = fields.CharField(description='业务ID', max_length=255, default="")
    business_type = fields.IntEnumField(FileType, description='文件类型', default=FileType.SIMPLE)
    create_time = fields.DatetimeField(description='创建时间', auto_now_add=True)
    update_time = fields.DatetimeField(description='修改时间', auto_now_add=True)

    class Meta:
        table = "blog_attachments"
        ordering = ['id']

    def __str__(self):
        return self.name
