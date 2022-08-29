import logging
from PIL import Image

logger = logging.getLogger(__name__)


def convert_image(path, target="result", _format="PNG"):
    im = Image.open(path)
    if _format in ("JPEG", "WEBP"):
        im = im.convert('RGB')
        im.save(f"{target}.{_format.lower()}", quality=95, format=_format)
    else:
        im.save(f"{target}.{_format.lower()}", format=_format)


def gif_handle(image_path_list, target="result.gif"):
    if not image_path_list:
        return []
    sequence = [Image.open(item) for item in image_path_list]
    sequence[0].save(f"{target}", save_all=True, append_images=sequence[1:], format="GIF")


def img2webp(path: str):
    im = Image.open(path)
    im = im.resize((500, 600))
    im.convert("RGB")
    im.save('result.webp', quality=100, format="webp")


def img2base64(image_path):
    import base64
    f = open(image_path, 'rb')
    base64_encode = base64.b64encode(f.read()).decode('utf-8')
    return base64_encode


def convert_svg():
    image = Image.open("lena.jpeg")
    assert "RGB" in image.mode, "图片格式类型不是RGB"
    pixels = image.load()
    width, height = image.size
    output = f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">'
    for col in range(height):
        def convert_pixel(row, opacity=1):
            r, g, b = pixels[col, row]
            color = "#%02X%02X%02X" % (r, g, b)
            return f'<rect x="{col}" y="{row}" width="1" height="1" fill="{color}" fill-opacity="{opacity}"/>'

        output += "".join(list(map(convert_pixel, range(width))))
    output += "</svg>"
    with open("result.svg", "w") as f:
        f.write(output)


#   初始化列表13812345678
# sequence = []
# for f in ImageSequence.Iterator(im):
#     #   获取图像序列病存储
#     sequence.append(f.copy())
# #   将图像序列逆转
# sequence.reverse()

if __name__ == '__main__':
    img2webp()
