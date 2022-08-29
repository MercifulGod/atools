import uvicorn
from core import create_app
from starlette.exceptions import HTTPException as StarletteHTTPException

from core.settings import templates

app = create_app()


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    return templates.TemplateResponse("404.html", {"request": request})


if __name__ == '__main__':
    uvicorn.run(
        app='app:app',
        host='0.0.0.0',
        port=3000,
        debug=False,
        reload=True,
    )
