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
        useCdnDomain: false,
        region: qiniu.region.z2,
        debugLogLevel: 'INFO'
    };
    let putExtra = {
        fname: "",
        params: {},
        mimeType: null
    };
    // console.log(options)

    // URL.revokeObjectURL($(".distImage img").attr("src"));
    // $(".distImage img").attr("src", URL.createObjectURL(data.dist))
    qiniu.compressImage(file, options).then(data => {
        const observable = qiniu.upload(data.dist, undefined, token, putExtra, config)
        const subscription = observable.subscribe(observer) // 上传开始
    }).catch(res => {
        console.log(res)
    })
}

