/**
 * 参考：http://t.zoukankan.com/eczhou-p-7860616.html
 * https://www.jianshu.com/p/bbc0fdb9ab1f?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation
 */


const puppeteer = require('puppeteer');
const url = require("url");
const https = require('http')

/**
 * 睡眠，单位秒
 * @param time
 * @returns {Promise<any>}
 */
function sleep(time) {
    return new Promise(resolve =>
        setTimeout(resolve, time * 1000)
    )
}


// 首先实现一个暂停函数
const pause = (duration) => new Promise((reslove) => setTimeout(reslove, duration));

/**
 * 异常重试
 * @param retries：重试次数
 * @param fn：执行函数
 * @param delay：延迟
 * @param err_callback：异常回调函数
 * @returns {Promise<any>}
 */
const backoff = async (fn, err_callback, retries, delay = 500) => {
    await fn().catch((err) => retries > 1
        ? pause(delay).then(async () => {
            await err_callback(err);
            await backoff(fn, err_callback, retries - 1, delay)
        })
        : Promise.reject(err)
    );
}


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

class SEO {
    //构造函数
    constructor(entry_url, proxy_ip, avg_time, debug) {
        let myURL = url.parse(entry_url, true)
        this.host = myURL.origin
        this.href = myURL.href
        this.debug = myURL.debug
        this.proxy_ip = proxy_ip


        /**
         * 平均访问时间 30分钟
         * @type {number}
         */
        this.avg_time = avg_time
    }

    //类中函数
    async init() {
        let user_agent = await this.getUserAgent()
        let browser = await puppeteer.launch({
            headless: !this.debug,
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',

                // debug logging
                '--enable-logging', '--v=1',
                `--proxy-server=${this.proxy_ip}`
            ]
        });

        console.log("SEO", this.proxy_ip, this.href)
        let page = await browser.newPage();
        await page.setUserAgent(user_agent)


        // Configure the navigation timeout 0: 不设置超时
        await page.setDefaultNavigationTimeout(0);
        // await page.setDefaultNavigationTimeout(20 * 1000)

        await page.setJavaScriptEnabled(true)

        this.browser = browser
        this.page = page
        await this.resetWidthAndHeight()
    }

    async run() {
        // await this.page.goto(this.href, {waitUntil: 'networkidle2',timeout:0});
        await backoff(async () => {
            // throw new Error("error");
            await this.page.goto(this.href, {waitUntil: 'load', timeout: 0});
        }, async (err) => {
            await this.resetProxyIP()
            console.log(this.proxy_ip, this.href, "switch_proxy_ip", err)
        }, 3)


        for (var i = 0; i < 2 * this.avg_time; i++) {
            console.log(this.proxy_ip, this.href, i)
            let rand = 20 + Math.floor((Math.random() * 20));
            await sleep(rand);
            await this.randScroll()
            if (rand < 25) continue
            await this.randomJump()
        }
    }

    async close() {
        this.browser.close();
    }


    async randScroll() {
        //随机滑动函数，模拟用户浏览网页
        let x = Math.floor((Math.random() * this.width));
        let y = Math.floor((Math.random() * this.height));
        await this.page.evaluate(`window.scrollTo(${x},${y})`)
    }

    async randomJump() {
        //随机跳转，点击打开新窗口的链接, 降低跳出率
        await this.page.evaluate(`() => {
              let links =  [...document.querySelectorAll('a')].filter(item => {
                    let href=item.getAttribute('href');
                    return href && (href.startsWith('/') || href.startsWith('${this.host}'))
              })
              var link = links[Math.floor(Math.random() * links.length)];
              if(link) link.click()
         }`)
        await this.resetWidthAndHeight()
    }

    async getUserAgent() {
        let USER_AGENTS = [
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; AcooBrowser; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
            "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; SLCC1; .NET CLR 2.0.50727; Media Center PC 5.0; .NET CLR 3.0.04506)",
            "Mozilla/4.0 (compatible; MSIE 7.0; AOL 9.5; AOLBuild 4337.35; Windows NT 5.1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
            "Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US)",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET CLR 2.0.50727; Media Center PC 6.0)",
            "Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET CLR 1.0.3705; .NET CLR 1.1.4322)",
            "Mozilla/4.0 (compatible; MSIE 7.0b; Windows NT 5.2; .NET CLR 1.1.4322; .NET CLR 2.0.50727; InfoPath.2; .NET CLR 3.0.04506.30)",
            "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN) AppleWebKit/523.15 (KHTML, like Gecko, Safari/419.3) Arora/0.3 (Change: 287 c9dfb30)",
            "Mozilla/5.0 (X11; U; Linux; en-US) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.6",
            "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.2pre) Gecko/20070215 K-Ninja/2.1.1",
            "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9) Gecko/20080705 Firefox/3.0 Kapiko/3.0",
            "Mozilla/5.0 (X11; Linux i686; U;) Gecko/20070322 Kazehakase/0.4.5",
            "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20",
            "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr) Presto/2.9.168 Version/11.52",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E; LBBROWSER)",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.84 Safari/535.11 LBBROWSER",
            "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)",
            "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SV1; QQDownload 732; .NET4.0C; .NET4.0E; 360SE)",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)",
            "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)",
            "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
            "Mozilla/5.0 (iPad; U; CPU OS 4_2_1 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:2.0b13pre) Gecko/20110307 Firefox/4.0b13pre",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:16.0) Gecko/20100101 Firefox/16.0",
            "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
            "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10"
        ]
        var index = Math.floor((Math.random() * USER_AGENTS.length));
        return USER_AGENTS[index];
    }

    async resetProxyIP() {
        this.proxy_ip = await http_get('http://82.157.136.146:5555/random')
    }

    async resetWidthAndHeight() {
        const dimensions = await this.page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio,
            };
        });
        this.width = dimensions.width
        this.height = dimensions.height
    }
}

//静态变量
SEO.average_time = 30;

module.exports = SEO;

