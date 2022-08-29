/**
 * todo: 减小跳出率，增加平均访问时间
 */

const https = require('http')
var SEO = require('./seo.js');


/**
 * 获取HTTP请求
 */
async function http_get(url) {
    return new Promise((resolve) => {
        let data = ""
        https.get(url, res => {
            res.on('data', chunk => {
                data += chunk
            })
            res.on('end', () => {
                resolve(data);
            })
        })
    })
}

async function getProxyIp() {
    return await http_get('http://82.157.136.146:5555/random')
}


(async () => {

    /**
     * 是否开启本地Debug模式
     */
    const debug = false

    /**
     * 模拟用户数量
     */
    const users = debug ? 1 : 300

    /**
     * 每批模拟用户数量
     */
    const patch_size = debug ? 1 : 5

    /**
     * 模拟用户平均访问时间，单位：分钟
     */
    const avg_time = 30


    /**
     * 模拟网站入口地址
     */
    const entry_url = 'https://ztf.net.cn/tools/urlEncode.html'
    const task = url => new Promise(async (resolve) => {
        let proxy_ip = await getProxyIp()
        let seo = undefined
        try {
            seo = new SEO(url, proxy_ip, avg_time, debug)
            await seo.init()
            await seo.run()
        }
        catch (err) {
            console.log(proxy_ip, url, err)
        }
        finally {
            await seo.close()
            resolve(url);

        }
    })
    for (var i = 0; i < users; i = i + patch_size) {
        console.time("timecost");
        await Promise.all(new Array(patch_size).fill(entry_url).map(item => task(item)));
        console.timeEnd("timecost");
    }

})();