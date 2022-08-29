from blog.views import router as blog_router
from tools.views import router as tool_router
from source.views import router as source_router
from yijing.views import router as yijing_router
from core.sitemap import router as sitemap_router


def router_init(app):
    app.include_router(blog_router)
    app.include_router(tool_router)
    app.include_router(source_router)
    app.include_router(sitemap_router)
    app.include_router(yijing_router)
