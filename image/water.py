import cv2
from PIL import Image, ImageDraw, ImageFont


#################################
# 给图片加上水印

# 文字水印
# 图片水印
# 盲水印


# 除水印
#
# 第一种：
##  选择图片修复图片
##  添加模版 ， 模版修复
#################################

class Water:
    def __init__(self):
        # 颜色对应http://www.yuangongju.com/color
        self.color_dict = {
            'white': (255, 255, 255, 255),
            'black': (0, 0, 0, 255),
            'gray': (205, 201, 201, 255),
            'red': (255, 0, 0, 255),
            'yellow': (255, 215, 0, 255),
            'blue': (0, 0, 170, 255),
            'purple': (205, 105, 201, 255),
            'green': (0, 205, 0, 255)
        }

        self.position_list = [1, 2, 3, 4]

    def one_water(self, image, text, position=1, fontsize=20, fontcolor='black'):
        """
        普通照片水印
        params:
            image:图片
            text:水印文字
            position:水印位置
                    1：左上
                    2：右上
                    3：右下
                    4：左下
            fontsize:字体大小
            fontcolor:字体颜色
                    [white, black, gray, red, yellow, blue, purple, green]
        """
        if position not in self.position_list:
            position = 1

        h, w = image.size[:2]

        keys = self.color_dict.keys()
        if fontcolor not in keys:
            fontcolor = 'black'
        color = self.color_dict[fontcolor]
        fnt = ImageFont.truetype('./fonts/FZYTK.TTF', fontsize)

        im = image.convert('RGBA')
        mask = Image.new('RGBA', im.size, (0, 0, 0, 0))

        d = ImageDraw.Draw(mask)

        size_h, size_w = d.textsize(text, font=fnt)

        alpha = 5
        if position == 1:
            weizhi = (0 + alpha, 0 + alpha)
        elif position == 2:
            weizhi = (h - size_h - alpha, 0 + alpha)
        elif position == 3:
            weizhi = (h - size_h - alpha, w - size_w - alpha)
        else:
            weizhi = (0 + alpha, w - size_w - alpha)

        # position 为左上角位置
        d.text(weizhi, text, font=fnt, fill=color)
        out = Image.alpha_composite(im, mask)
        return out

    def fill_water(self, image, text, fontsize):
        """
        半透明水印，布满整张图，并且自动旋转45°
        params:
            image:图片
            text:文字
            fontsize:文字大小
        """
        font = ImageFont.truetype('./fonts/FZYTK.TTF', fontsize)

        # 添加背景
        new_img = Image.new('RGBA', (image.size[0] * 3, image.size[1] * 3), (255, 255, 255, 255))
        new_img.paste(image, image.size)

        # 添加水印
        font_len = len(text)
        rgba_image = new_img.convert('RGBA')
        text_overlay = Image.new('RGBA', rgba_image.size, (0, 0, 0, 0))
        image_draw = ImageDraw.Draw(text_overlay)

        for i in range(0, rgba_image.size[0], font_len * 40 + 100):
            for j in range(0, rgba_image.size[1], 200):
                # print(f'i:{i}, j:{j}, text:{text}, font:{font}')
                image_draw.text((i, j), text, font=font, fill=(0, 0, 0, 50))
        text_overlay = text_overlay.rotate(-45)
        image_with_text = Image.alpha_composite(rgba_image, text_overlay)

        image_with_text = image_with_text.crop((image.size[0], image.size[1], image.size[0] * 2, image.size[1] * 2))
        return image_with_text


# coding:utf-8

from PIL import Image, ImageDraw, ImageFont


def add_text_to_image(image, text):
    font = ImageFont.truetype('C:\Windows\Fonts\STXINGKA.TTF', 36)

    # 添加背景
    new_img = Image.new('RGBA', (image.size[0] * 3, image.size[1] * 3), (0, 0, 0, 0))
    new_img.paste(image, image.size)

    # 添加水印
    font_len = len(text)
    rgba_image = new_img.convert('RGBA')
    text_overlay = Image.new('RGBA', rgba_image.size, (255, 255, 255, 0))
    image_draw = ImageDraw.Draw(text_overlay)

    for i in range(0, rgba_image.size[0], font_len * 40 + 100):
        for j in range(0, rgba_image.size[1], 200):
            image_draw.text((i, j), text, font=font, fill=(0, 0, 0, 50))
    text_overlay = text_overlay.rotate(-45)
    image_with_text = Image.alpha_composite(rgba_image, text_overlay)

    # 裁切图片
    image_with_text = image_with_text.crop((image.size[0], image.size[1], image.size[0] * 2, image.size[1] * 2))
    return image_with_text


def PIL_font(file_path='F:/Picture/touxiang.jpg'):
    image = Image.open(file_path)
    draw = ImageDraw.Draw(img)
    myfont = ImageFont.truetype('C:/windows/fonts/Arial.ttf', size=40)
    fillcolor = "#ff0000"
    width, height = img.size
    draw.text((width - 50, 5), '99', font=myfont, fill=fillcolor)
    img.save('result.jpg', 'jpeg')

    return 0


if __name__ == '__main__':
    img = Image.open("test.jpg")
    im_after = add_text_to_image(img, u'石家庄')
    im_after.save(u'水印.png')

    img = Image.open("imgs/water/1.jpg")
    fontcolor = 'yellow'
    water = Water()
    text = "hello world"
    fill_img = water.fill_water(img, text, fontsize=36)
    # 一定要保存为png格式
    fill_img.save(u'imgs/water/fill_img.png')
    print('finish')
