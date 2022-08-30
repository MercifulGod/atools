// const observer = {
//     next(res) {
//         // let total = response.total;
//         // $(".speed").text("进度：" + total.percent + "% ");
//     },
//     error(err) {
//         // ...
//     },
//     complete(res) {
//         // ...
//         key = res.key
//     }
// }

function qiniu_compress_upload(file, token, observer) {
    let options = {
        quality: 0.92,
        noCompressIfLarger: true,
        outputType: file.type
    }

    let config = {
        checkByMD5: true,
        checkByServer: true,
        debugLogLevel: "INFO",
        disableStatisticsReport: false,
        forceDirect: false,
        region: "z2",
        retryCount: 6,
        useCdnDomain: false
    };
    let putExtra = {
        customVars: {}
    };

    // gif 无法压缩
    if ("image/gif" === file.type) {
        try {
            const observable = qiniu.upload(file, undefined, token, putExtra, config)
            const subscription = observable.subscribe(observer) // 上传开始
        }
        catch (err) {
            console.log(err)
        }

    }
    else {
        qiniu.compressImage(file, options).then(data => {
            const observable = qiniu.upload(data.dist, undefined, token, putExtra, config)
            const subscription = observable.subscribe(observer) // 上传开始
        }).catch(res => {
            console.log(res)
        })
    }

}

