import asyncio
from datetime import datetime
from urllib import parse

from pyppeteer import launch
import logging
import requests, time, random, pymysql, threading
from huey import SqliteHuey

huey = SqliteHuey(filename='/tmp/demo.db')


def get_host(entry_url):
    """过滤出有效的URL地址,并修复破损的URL地址"""
    parse_url = parse.urlparse(entry_url)
    if not parse_url.scheme or not parse_url.netloc:
        return
    return f"{parse_url.scheme}://{parse_url.netloc}"


async def simulate_web_click(entry_url, user_agent=None, proxy_ip=None, average_time=None, callback=None):
    """
    :param entry_url: 模拟的入口地址
    :param user_agent:
    :param proxy_ip:  代理IP
    :param average_time:  用户平均访问时间
    :param callback:  status 【'start','success','fail',1...3,, 】 代表任务执行进度
    :return:
    """
    try:
        host = get_host(entry_url)
        params = {'headless': False, "ignoreHTTPSErrors": True}
        if proxy_ip:
            params["args"] = [f"--proxy-server={proxy_ip}"]
        browser = await launch(params)
        page = await browser.newPage()
        page.setDefaultNavigationTimeout(20 * 1000)  # 毫秒
        await page.setJavaScriptEnabled(True)
        if user_agent:
            await page.setUserAgent(user_agent)
        await page.goto(entry_url, {"waitUntil": "load"})

        # await page.screenshot({'path': 'example.png'})
        # await page.setExtraHTTPHeaders({"referer": random.choice(links)})

        async def get_width_height():
            dimensions = await page.evaluate('''() => {
                     return {
                         width: document.body.clientWidth,
                         height: document.body.clientHeight,
                         deviceScaleFactor: window.devicePixelRatio,
                     }
                 }''')
            return dimensions.get("width"), dimensions.get("height")

        async def rand_scroll():
            """随机滑动函数，模拟用户浏览网页"""
            await page.evaluate(f"window.scrollTo({random.randint(1, width)},{random.randint(1, height)})")

        async def random_jump():
            """随机跳转，点击打开新窗口的链接, 降低跳出率"""
            await page.evaluate("""() => {
                      let links =  [...document.querySelectorAll('a')].filter(item => {
                            let href=item.getAttribute('href'); 
                            return href && (href.startsWith('/') || href.startsWith('""" + host + """'))
                      })
                      var link = links[Math.floor(Math.random() * links.length)];
                      if(link) link.click()
                }""")

        # 开始模拟用户行为
        width, height = await get_width_height()
        times = average_time // 20
        offset = times // 5
        step = 0  # 任务执行进度
        for i in range(random.randint(times - offset, times + offset)):
            await asyncio.sleep(random.randint(10, 30))
            await rand_scroll()
            if i % 5 == 0:
                await random_jump()
            if callback:
                callback(step)
        await browser.close()
        if callback:
            callback("success")
    except Exception as e:
        logging.exception("任务失败")
        if callback:
            callback("fail")



@huey.task()
def seo_simulate_click(url_list):
    """ 模拟用户点击，刷点击率
    """
    try:
        print("seo_simulate_click")
        assert isinstance(url_list, list), url_list
        new_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(new_loop)
        loop = asyncio.get_event_loop()

        user_num = 2
        sub_task_id = 0
        result = {}
        for url in url_list:
            start_time = datetime.now().now()
            average_time = 60 * 10  # 平均访问时间
            tasks = []
            for i in range(user_num):
                def callback(status):
                    result[sub_task_id]["status"] = status
                    # result[sub_task_id]["time_cost"] = get_cost_time(start_time)

                user_agent = None
                proxy_ip = None
                result[sub_task_id] = {"id": sub_task_id, "url": url, "proxy_ip": proxy_ip, "user_agent": user_agent, "time_cost": 0,
                                       "status": "loading"}
                tasks.append(simulate_web_click(url, user_agent=user_agent, proxy_ip=proxy_ip, average_time=average_time, callback=callback))

            loop.run_until_complete(asyncio.gather(*tasks, loop=loop, return_exceptions=True))
        logging.exception("seo_simulate_click end")
    except Exception as e:
        logging.exception("seo_simulate_click error")
    # 标志任务结束
    return "end"


result = seo_simulate_click(["1111"])
print(result())
