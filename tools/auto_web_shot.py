"""
# 功能：自动生成网页快照，全屏快照
"""

import time
import os.path
import tempfile
from PIL import Image
from selenium import webdriver


def webshot(kwargs):
    link = kwargs.get("link")
    filename = kwargs.get("filename")
    print("当前进程%d已启动" % os.getpid())

    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 不知为啥只能在无头模式执行才能截全屏
    # options.add_argument('--disable-gpu')
    driver = webdriver.Chrome("./chromedriver", options=options)
    # driver.maximize_window()
    driver.set_window_size(1920, 1080)
    # 返回网页的高度的js代码
    js_height = "return document.body.clientHeight"
    print(link)

    try:
        driver.get(link)
        k = 1
        height = driver.execute_script(js_height)
        while True:
            if k * 500 < height:
                js_move = "window.scrollTo(0,{})".format(k * 500)
                print(js_move)
                driver.execute_script(js_move)
                time.sleep(1)
                height = driver.execute_script(js_height)
                k += 1
            else:
                break
        scroll_width = driver.execute_script('return document.body.parentNode.scrollWidth')
        scroll_height = driver.execute_script('return document.body.parentNode.scrollHeight')
        driver.set_window_size(scroll_width, scroll_height)

        png = driver.get_screenshot_as_png()
        to_webp(filename, png)
        # driver.get_screenshot_as_file("./pics/" + filename)
        print(f"Process {link} get one pic !!!")
        driver.quit()
    except Exception as e:
        print(filename, e)
        print(f"Process {link} error !!!")


# 转换格式png to webp
def to_webp(save_path, png):
    with tempfile.TemporaryFile() as fp:
        fp.write(png)
        fp.seek(0)
        im = Image.open(fp)
        im.save(save_path, "WEBP")


def run__pool(data):  # main process
    from multiprocessing import Pool
    cpu_worker_num = 3
    start_time = time.time()
    with Pool(cpu_worker_num) as p:
        outputs = p.map(webshot, data)
    print(f'| outputs: {outputs}    TimeUsed: {time.time() - start_time:.1f}    \n')


if __name__ == '__main__':
    with open("urls.txt", "r+", encoding="utf-8") as f:
        data = f.readlines()

    result = []
    for item in data:
        item = item.replace("\n", "")
        link, preview = item.split("  ")
        result.append({"link": link, "filename": f"{preview}/preview.webp"}, )
    run__pool(result)
