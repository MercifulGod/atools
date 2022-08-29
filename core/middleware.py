from starlette.middleware.cors import CORSMiddleware
from starlette_session import BackendType, SessionMiddleware

origins = [
    "*"
]


def middleware_init(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # app.add_middleware(
    #     SessionMiddleware,
    #     secret_key="secret",
    #     cookie_name="cookie22",
    #     backend_type=BackendType.redis,
    #     backend_client=rediss
    # )

    # @app.middleware("http")
    # async def session_user(request: Request, call_next):
    #     user_id = request.session.get("user_id")
    #     if user_id:
    #         request.user = await User.filter(id=user_id).first()
    #         
    #     response = await call_next(request)
    #     # process_time = time.time() - start_time
    #     # response.headers["X-Process-Time"] = str(process_time)
    #     return response
