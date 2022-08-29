import functools

from starlette.responses import RedirectResponse


def auth(fn):
    @functools.wraps(fn)
    async def wrapper(request, *args, **kwargs):
        if not request.session.get("user_id"):
            # 我发现在FastAPI中，starlette响应的默认代码是307，它在重定向期间保留了方法，因此产生了post请求。我通过在返回响应之前添加response.status_code = 302解决了这个问题。
            return RedirectResponse(url="/login.html", status_code=302)
        return await fn(request, *args, **kwargs)

    return wrapper
