# -*- coding: utf-8 -*-
# 七牛上传文件

from qiniu import Auth, put_file, etag, put_data
import os
from typing import Callable, List, Optional
from starlette.datastructures import UploadFile

# 需要填写你的 Access Key 和 Secret Key
access_key = '_Awm7oHMwG7glsnSWnrPnw_PVYCSUUq0ILoGc7U8'
secret_key = '4jndmdBIzxjE-J3qImjXu_ctRZHqKZ4AWpQV2u0r'
# 构建鉴权对象
q = Auth(access_key, secret_key)
# 要上传的空间
bucket_name = 'itnote'


class QiniuFileUpload:
    def __init__(
            self,
            uploads_dir: str,
            allow_extensions: Optional[List[str]] = None,
            max_size: int = 1024 ** 3,
            filename_generator: Optional[Callable] = None,
            prefix: str = "/static/uploads",
    ):
        self.max_size = max_size
        self.allow_extensions = allow_extensions
        self.uploads_dir = uploads_dir
        self.filename_generator = filename_generator
        self.prefix = prefix

    async def upload(self, file: UploadFile):
        # 生成上传 Token，可以指定过期时间等
        token = q.upload_token(bucket_name, None, 3600)
        content = await file.read()
        ret, info = put_data(token, None, content)
        return f'http://cdn.ztf.net.cn/{ret.get("key","")}{os.path.splitext("zz")[-1]}'


def get_token():
    token = q.upload_token(bucket_name, None, 3600)
    return token
