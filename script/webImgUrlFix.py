#!/usr/bin/python
# -*- coding: utf-8 -*-

"""

# 功能：修复<img> src
# 1、下载图片到本地
# 2、替换图片src地址为本地地址

example:

origin: <img alt="title" src="http://www.baidu.com/uploads/allimg/141114/3-141114151914W7.png" style=""/>
target: <img alt="title" src="/static/uploads/3-141114151914W7.png" style=""/>

"""

import json
import os
import requests
import re


def swap_src_to_local(doc: str, save_path="/tmp/static"):
    image_list = re.findall(r'<img.*src="(.*?)".*\/>', doc)
    for img_url in image_list:
        print(img_url)
        try:
            image_name = img_url.split("/")[-1]
            response = requests.get(img_url)

            if not os.path.exists(save_path):
                os.makedirs(save_path)

            with open(os.path.join(save_path, image_name), "wb") as f:
                f.write(response.content)

            doc = doc.replace(img_url, f"{save_path}/{image_name}")
        except:
            print(img_url)
            continue

    return doc


def save_to_json(path, data):
    with open(path, "w+") as f:
        json.dump(data, f, ensure_ascii=False)


if __name__ == '__main__':
    doc = swap_src_to_local(
        '<img alt="" src="http://www.baidu.com/uploads/allimg/141114/3-141114151914W7.png" style=""/>'
    )
    print(doc)
