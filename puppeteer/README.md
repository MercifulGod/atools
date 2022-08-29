
# 功能：模拟用户点击，增加浏览量


https://github.com/alekzonder/docker-puppeteer

```bash
docker run -d --shm-size 1G --sysctl net.ipv6.conf.all.disable_ipv6=1 --rm \
-v /root/itnote/code_server/puppeteer:/app \
    alekzonder/puppeteer:1.1.1 node app.js
```

# 查看日志
docker logs -f --tail 100 e4e71005bf9f


# 启动命令
docker run --shm-size 1G --rm  -v /root/itnote/code_server/puppeteer:/app  alekzonder/puppeteer:1.1.1  node app.js



# 本地运行

导入其他目录环境
export NODE_PATH="/tmp/node_modules"

启动命令
node app.js