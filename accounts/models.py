import datetime

from tortoise import Model, fields
from source.enums import UserType
from fastapi_admin.models import AbstractAdmin


class Admin(AbstractAdmin):
    last_login = fields.DatetimeField(description="Last Login", default=datetime.datetime.now)
    email = fields.CharField(max_length=200, default="")
    avatar = fields.CharField(max_length=200, default="")
    intro = fields.TextField(default="")
    user_type = fields.IntEnumField(UserType, description='是否员工', default=UserType.normal)
    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.pk}#{self.username}"
