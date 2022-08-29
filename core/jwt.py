# -*- coding: utf-8 -*-
# @Time    : 2022/4/12 20:20
# @Author  : Lifeng
# pip install passlib
# pip install python-jose


# from typing import Optional
# from jose import JWTError, jwt
# from sc_app import settings as sp
# from datetime import timedelta, datetime
from passlib.context import CryptContext


# from fastapi import status, Header, HTTPException

#
# def verify_x_token(x_token: str = Header(default="debugfeng")):
#     """
#     校验鉴权
#     :param x_token:
#     :return:
#     """
#     if x_token != "debugfeng":
#         raise HTTPException(status_code=400, detail="not x_token in header !")
#
#
# def generate_access_token(data: dict, expiration: Optional[timedelta] = None):
#     """
#     生成token并加密
#     :param data:
#     :param expiration:
#     :return:
#     """
#     to_encode = data.copy()
#     if expiration:
#         expire = datetime.utcnow() + expiration
#     else:
#         expire = datetime.utcnow() + timedelta(days=3)
#     to_encode.update({"exp": expire})
#     to_encode_jwt = jwt.encode(to_encode, key=sp.KEY, algorithm=sp.ALGORITHM)
#     return to_encode_jwt
#
#
# def verify_token(x_token: str = Header(...), token: str = Header(...)):
#     """
#     获取用户并解密token
#     :param x_token:
#     :param token:
#     :return:
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail={"Message": " 凭证错误或已失效啦...... "},
#     )
#     credentials_exception_token = HTTPException(
#         status_code=status.HTTP_403_FORBIDDEN,
#         detail={"Message": " 用户未登录或者登陆 token 已经失效！"}
#     )
#     try:
#         #   解析token值
#         payload = jwt.decode(token, key=sp.KEY, algorithms=sp.ALGORITHM)
#         username: str = payload["username"]
#         #   判断用户是不是空值
#         if username is None:
#             raise credentials_exception
#         #   redis读取token值
#         redis_token = redispy.get_value(username, is_data=True)
#         #   如不满足条件则抛出错误
#         if not username and not redis_token and x_token != "debugfeng" and redis_token != token:
#             raise credentials_exception_token
#         return
#     except JWTError:
#         raise credentials_exception


def encryption_password_or_decode(pwd: str, hashed_password: str = None):
    """
    密码加密或解密
    :param pwd:
    :param hashed_password:
    :return:
    """
    encryption_pwd = CryptContext(
        schemes=["sha256_crypt", "md5_crypt", "des_crypt"]
    )

    def encryption_password():
        password = encryption_pwd.hash(pwd)
        return password

    def decode_password():
        password = encryption_pwd.verify(pwd, hashed_password)
        return password

    return decode_password() if hashed_password else encryption_password()


# hashed_password = encryption_password_or_decode(pwd=user.password)


def check_user(user: str, pwd: str):
    """
    根据输入的用户信息，数据库查询比对账号和密码，并对密码进行解密操作
    :param user:
    :param pwd:
    :param db:
    :return:
    """
    username, password = db.query(
        user_models.Users.username, user_models.Users.password
    ).filter(user_models.Users.username == user).first()

    if not username and not encryption_password_or_decode(pwd=pwd, hashed_password=password):
        return False
    return True


if __name__ == '__main__':
    tmp1 = encryption_password_or_decode("123456")
    tmp2 = encryption_password_or_decode("123456", tmp1)
    print(tmp2)
