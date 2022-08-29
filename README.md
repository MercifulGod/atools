## 在线演示
[ztf.net.cn](https://ztf.net.cn)  



## 数据库配置
```bash
CREATE DATABASE `djangoblog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
create user 'admin'@'%' identified by '123456';
grant all on djangoblog.* to 'admin'@'%';
flush privileges;
```

## redis 安装

```bash
docker run -it -d --name redis -p6379:6379 redis --bind 0.0.0.0 --protected-mode no
```
--bind			   设置redis配置中的bind(redis用来限制访问的ip地址 默认为127.0.0.1)  
--protected-mode   设置保护模式(默认为yes 开启了保护模式，限制只能本地访问)  




### 创建超级用户

注册用户：
http://localhost:port/admin/init  

登录
http://localhost:port/admin/login  




### 在线工具
[编码转换](https://ztf.net.cn/tools/urlEncode.html)  
[加密解密](https://ztf.net.cn/tools/aesEncrypt.html)  
[时间戳转化](https://ztf.net.cn/tools/timestamp.html)  
[压缩格式化](https://ztf.net.cn/tools/jsformat.html)  
[图片除水印](https://ztf.net.cn/tools/imgWaterRemove.html)  
[视频除水印](https://ztf.net.cn/tools/water/video.html)  
[二维码工具](https://ztf.net.cn/tools/qrcode.html)  
[诸葛神算](https://ztf.net.cn/fs/zhugeshenshu.html)  
[易经64卦](https://ztf.net.cn/fs/yijing64.html)  
[45中字体特效](https://ztf.net.cn/t/1-n?cate=0&tag=30)  
[在线录屏](https://ztf.net.cn/tools/screen-record.html)  
[网址导航](https://ztf.net.cn/tools/web_nav.html)  


### 脚本工具


|    工具      |      位置      |   
| :--------:   | :---------------: |
| 图片对比度调整 | image/contrast.py |  
|   图片除雾    | image/demist.py   |  
| 图片格式转化   | image/ImgFormat.py|




