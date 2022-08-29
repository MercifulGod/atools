from enum import Enum, IntEnum


class ProductType(IntEnum):
    article = 1
    page = 2


class Status(IntEnum):
    on = 1
    off = 0


class DeleteStatus(IntEnum):
    on = 0
    off = 1


class Action(str, Enum):
    create = "create"
    delete = "delete"
    edit = "edit"


class MaterialType(IntEnum):
    codepin = 1
    yuanma = 2  # 源码


class TagType(IntEnum):
    article = 1  # 文章标签
    material = 2  # 素材


class UserType(IntEnum):
    admin = 1  # 管理员
    normal = 2  # 普通用户


class TagRelationType(str, Enum):
    MATERIAL = "material"
    ARTICLE = "article"
