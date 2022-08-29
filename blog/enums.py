from enum import Enum, IntEnum


class UserType(IntEnum):
    admin = 1  # 管理员
    normal = 2  # 普通用户


class ArticleStatus(IntEnum):
    PUBLISH = 1
    DRAFT = 0


class ArticleRelationType(IntEnum):
    TAG = 1
    LIKE_USER = 2


class FileType(IntEnum):
    SIMPLE = 1
