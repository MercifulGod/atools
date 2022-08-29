import sys
import os
from fastapi.templating import Jinja2Templates
from fastapi_admin.file_upload import FileUpload

from core.qiniuUtils import QiniuFileUpload

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = BASE_DIR + "/static"
templates = Jinja2Templates(directory=BASE_DIR + "/templates")

upload = FileUpload(uploads_dir=os.path.join(BASE_DIR, "static", "uploads"))
# upload = QiniuFileUpload(uploads_dir=os.path.join(BASE_DIR, "static", "uploads"))


DEBUG = True

# 网站地址
HTTP_HOST = "0.0.0.0:3003"

# 系统安全秘钥
SECRET_KEY = 'ZEuk2U9svM2WRJql4Fs2lEvD05ZDQXZdKboim__SQqsUUqJwStZJq6u0e30bIL4Qe80PB48X1dcIZHjxqLzUiA'

# API版本号
API_V1_STR = "/api/v1"

# token过期时间
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8

# 算法
ALGORITHM = "HS256"

DATABASE_URL = "mysql://{}:{}@{}:{}/{}?charset=utf8mb4".format(
    os.environ.get('DJANGO_MYSQL_USER') or 'root',
    os.environ.get('DJANGO_MYSQL_PASSWORD') or '123456',
    os.environ.get('DJANGO_MYSQL_HOST') or 'localhost',
    int(os.environ.get('DJANGO_MYSQL_PORT') or 3306),
    os.environ.get('DJANGO_MYSQL_DATABASE') or "djangoblog"
)
