/*
 * License:  The MIT License (MIT) Ryasnoy Paul、todaylg
 * 功能： tools 工具的核心功能文件，该文件加密修改文件名后为/templates/tools/snippet/jquery.js
 */


/**
 * 功能:  开启无限Debug
 */
// setInterval(function () {
//     debugger;
// }, 1000)
//
// setTimeout(function b() {
//     debugger;
//     setTimeout(b, 1000)
// }, 1000)


CoreTool = (function () {
    var lib = {}

    /*
    * 功能:  URL编码
    */
    lib.urlEncode = function (value) {
        return {
            "encodeURI": encodeURI(value),
            "encodeURIComponent": encodeURIComponent(value),
        }
    }

    /*
    * 功能:  URL解码
    */
    lib.urlDecode = function (value) {
        return {
            "encodeURI": decodeURI(value),
            "encodeURIComponent": decodeURIComponent(value),
        }
    }


    /*
    * 功能:  中文转UTF-8编码
    */
    lib.zh2utf8 = function (value) {
        return value.replace(/[^\u0000-\u00FF]/g, function ($0) {
            return escape($0).replace(/(%u)(\w{4})/gi, "&#x$2;")
        })
    }

    /*
    * 功能:  UTF-8转中文
    */
    lib.utf8ToZH = function (value) {
        return unescape(value.replace(/&#x/g, '%u').replace(/;/g, ''))
    }


    lib.native2ascii = function (value, ignoreLetter = false) {
        var nativecode = value.split("");
        var ascii = "";
        for (var i = 0; i < nativecode.length; i++) {
            var code = Number(nativecode[i].charCodeAt(0));
            if (!ignoreLetter || code > 127) {
                var charAscii = code.toString(16);
                charAscii = new String("0000").substring(charAscii.length, 4) + charAscii;
                ascii += "\\u" + charAscii;
            } else {
                ascii += nativecode[i];
            }
        }
        return ascii
    }


    lib.ascii2native = function (value) {
        let asciicode = value.split("\\u");
        let result = asciicode[0];
        for (var i = 1; i < asciicode.length; i++) {
            var code = asciicode[i];
            result += String.fromCharCode(parseInt("0x" + code.substring(0, 4)));
            if (code.length > 4) {
                result += code.substring(4, code.length);
            }
        }
        return result
    }


    /**
     * 功能:  中文符号转英文符号
     */
    lib.zhToEnSymbol = function (value) {
        var result = value.trim();
        if (!result) return

        result = result.replace(/\’|\‘/g, "'").replace(/\“|\”/g, "\"");
        result = result.replace(/\【/g, "[").replace(/\】/g, "]").replace(/\｛/g, "{").replace(/\｝/g, "}");
        result = result.replace(/，/g, ",").replace(/：/g, ":");
        return result
    }


    /**
     * 功能:  ASCII 转换 Unicode
     */
    lib.asciiToUnicode = function (value) {
        if (!value) return

        let result = '';
        for (var i = 0; i < value.length; i++) {
            result += '&#' + value.charCodeAt(i) + ';';
        }
        return result
    }


    /**
     * 功能:  Unicode 转换 ASCII
     */
    lib.unicodeToAscii = function (value) {
        if (!value) return
        let result = '';
        let code = value.match(/&#(\d+);/g);
        for (var i = 0; i < value.length; i++) {
            result += String.fromCharCode(code[i].replace(/[&#;]/g, ''));
        }
        return result
    }

    /**
     * 功能:  Unicode 转 中文,GB2312Unicode
     */
    lib.unicodeToZH = function (value) {
        console.log("unicodeToZH", value)
        if (!value) return
        let result = unescape(value.replace(/\\u/gi, '%u'));
        console.log("unicodeToZH", value, result)
        return result
    }

    /**
     * 功能:  中文转Unicode
     */
    lib.zhToUnicode = function (value) {
        console.log("unicodeToZH", value)
        if (!value) return
        let result = escape(value).toLocaleLowerCase().replace(/%u/gi, '\\u');
        console.log("unicodeToZH", value, result)
        return result.replace(/%7b/gi, '{').replace(/%7d/gi, '}').replace(/%3a/gi, ':').replace(/%2c/gi, ',').replace(/%27/gi, '\'').replace(/%22/gi, '"').replace(/%5b/gi, '[').replace(/%5d/gi, ']').replace(/%3D/gi, '=').replace(/%20/gi, ' ').replace(/%3E/gi, '>').replace(/%3C/gi, '<').replace(/%3F/gi, '?');
    }


    /**
     * 功能:  格式化XML
     */
    lib.prettyXML = function (value) {
        var ar = value.replace(/>\s{0,}</g, "><")
                .replace(/</g, "~::~<")
                .replace(/\s*xmlns\:/g, "~::~xmlns:")
                .replace(/\s*xmlns\=/g, "~::~xmlns=")
                .split('~::~'),
            len = ar.length,
            inComment = false,
            deep = 0,
            str = '',
            ix = 0;

        for (ix = 0; ix < len; ix++) {
            // start comment or <![CDATA[...]]> or <!DOCTYPE //
            if (ar[ix].search(/<!/) > -1) {
                str += this.shift[deep] + ar[ix];
                inComment = true;
                // end comment  or <![CDATA[...]]> //
                if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
                    inComment = false;
                }
            } else
            // end comment  or <![CDATA[...]]> //
            if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
                str += ar[ix];
                inComment = false;
            } else
            // <elm></elm> //
            if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) &&
                /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')) {
                str += ar[ix];
                if (!inComment) deep--;
            } else
            // <elm> //
            if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
                str = !inComment ? str += this.shift[deep++] + ar[ix] : str += ar[ix];
            } else
            // <elm>...</elm> //
            if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
                str = !inComment ? str += this.shift[deep] + ar[ix] : str += ar[ix];
            } else
            // </elm> //
            if (ar[ix].search(/<\//) > -1) {
                str = !inComment ? str += this.shift[--deep] + ar[ix] : str += ar[ix];
            } else
            // <elm/> //
            if (ar[ix].search(/\/>/) > -1) {
                str = !inComment ? str += this.shift[deep] + ar[ix] : str += ar[ix];
            } else
            // <? xml ... ?> //
            if (ar[ix].search(/<\?/) > -1) {
                str += this.shift[deep] + ar[ix];
            } else
            // xmlns //
            if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
                str += this.shift[deep] + ar[ix];
            }

            else {
                str += ar[ix];
            }
        }

        return (str[0] == '\n') ? str.slice(1) : str;
    }


    /**
     * 功能:  最小化XML
     */
    lib.minXML = function (value, preserveComments = true) {
        var str = preserveComments ? value : value.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "")
            .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
        return str.replace(/>\s{0,}</g, "><");
    }


    /**
     * 功能：格式化Json
     * @param indentation： 缩进默认为是个空格
     */
    lib.prettyJson = function (value, indentation = "    ") {
        if (typeof JSON === 'undefined') return value;
        if (typeof value === "string") {
            return JSON.stringify(JSON.parse(value), null, indentation);
        }
        if (typeof value === "object") {
            return JSON.stringify(value, null, indentation);
        }
        return value;
    }


    /**
     * 功能:  最小化Json
     */
    lib.minJson = function (value) {
        if (typeof JSON === 'undefined') return value;
        return JSON.stringify(JSON.parse(value), null, 0);
    }


    /**
     * 功能:  最小化CSS
     */
    lib.minCSS = function (value, preserveComments = true) {
        var str = preserveComments ? value : value.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g, "");
        return str.replace(/\s{1,}/g, ' ')
            .replace(/\{\s{1,}/g, "{")
            .replace(/\}\s{1,}/g, "}")
            .replace(/\;\s{1,}/g, ";")
            .replace(/\/\*\s{1,}/g, "/*")
            .replace(/\*\/\s{1,}/g, "*/");
    }

    /**
     * 功能:  最小化SQL
     */
    lib.minSQL = function (value) {
        return value.replace(/\s{1,}/g, " ").replace(/\s{1,}\(/, "(").replace(/\s{1,}\)/, ")")
    }

    /**
     * 功能：动态加载JS
     * @param src: script 地址
     * @param sync: 异步加载还是同步加载
     * @param callback： 回调函数
     */
    lib.createScript = function (src, sync = true, callback = undefined) {
        let script = document.createElement('script');
        script.src = src;
        // 保证JS顺序执行！
        script.async = sync
        if (callback) {
            script.onload = () => {
                callback()
            }
        }
        document.body.appendChild(script);
    }


    /**
     * 功能：加载对于的JS，用于隐藏真实JS
     * @param module: 加载的模块名称
     * @param callback： 回调函数
     */
    lib.loadJS = function (module, callback = undefined) {
        if (module === "js") {
            this.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/javascript.js', false, callback);
            this.createScript('/static/prettier/standalone.js');
            this.createScript('/static/prettier/parser-typescript.js');
            this.createScript('/static/prettier/obfuscate.js');
        } else if (module === "css") {
            CoreTool.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/css.js', false, callback);
            CoreTool.createScript('/static/prettier/standalone.js');
            CoreTool.createScript('/static/prettier/parser-postcss.js');
        }
        else if (module === "html") {
            CoreTool.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/xml.js', false, callback);
            CoreTool.createScript('/static/prettier/standalone.js');
            CoreTool.createScript('/static/prettier/parser-html.js');
        }

        else if (module === "json") {
            CoreTool.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/css.js', false, callback);
        }
        else if (module === "sql") {
            CoreTool.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/sql.js', false, callback);
            CoreTool.createScript('/static/prettier/prettier-sql.min.js');
        }
        else if (module === "markdown") {
            CoreTool.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/markdown.js', false, callback);
            CoreTool.createScript('/static/prettier/standalone.js');
            CoreTool.createScript('/static/prettier/parser-markdown.js');
        }

        else if (module === "xml") {
            CoreTool.createScript('/static/codemirror/codemirror.js', false);
            CoreTool.createScript('/static/codemirror/xml.js', false, callback);
            CoreTool.createScript('/static/prettier/XmlBeautify.js');
        }


    }


    lib.jsPretty = function (value) {
        return prettier.format(value, {parser: "typescript", plugins: prettierPlugins});
    }

    lib.jsObfuscate = function (value) {
        return JavaScriptObfuscator.obfuscate(value, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            }
        )
    }

    lib.cssPretty = function (value) {
        return prettier.format(value, {parser: "css", plugins: prettierPlugins});
    }

    lib.htmlPretty = function (value) {
        return prettier.format(value, {parser: "html", plugins: prettierPlugins});
    }

    lib.sqlPretty = function (value) {
        return prettierSql.format(value);
    }

    lib.xmlPretty = function (value) {
        return new XmlBeautify().beautify(value);
    }


    lib.markdownPretty = function (value) {
        return prettier.format(value, {parser: "markdown", plugins: prettierPlugins});
    }

    /**
     * 拦截console.log
     * @param callback
     */
    lib.proxyConsoleLog = function (callback) {
        console.oldLog = console.log;
        console.log = function (value) {
            callback(value)
            console.oldLog(value);
        }
    }

    /**
     * 恢复console.log
     * @param callback
     */
    lib.restoreConsoleLog = function () {
        console.log = console.oldLog
    }

    return lib
})()


function formatFileSize(value) {
    if (null == value || value === '') {
        return "0 Bytes";
    }
    var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
    var srcsize = parseFloat(value);
    var index = Math.floor(Math.log(srcsize) / Math.log(1024));
    var size = srcsize / Math.pow(1024, index);
    size = size.toFixed(2);//保留的小数位数
    return size + unitArr[index];
}


function downloadByBlob(url, name) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

/**
 *
 * 绘制文本水印
 * @param canvas
 * @param textWaterMarkList [{
            "text": "Hello world!", //水印文本
            "width": "Hello world!",
            "height": "",
            "rotate": 0, //旋转角度
            "top": 30,  // 顶部距离
            "left": 30,  // 左边距离
            "fontSize": "30",
            "fontFamily": "SimSun",
            "alpha": 0.6, //透明度
            "italic": false, //斜体字
            "bold": false, //粗体
      }],
 */
function drawTextWater(canvas, textWaterMarkList) {
    let ctx = canvas.getContext('2d')
    for (var i = 0; i < textWaterMarkList.length; i++) {
        let waterMark = textWaterMarkList[i]
        let fontStyle = `${waterMark.fontSize}px ${waterMark.fontFamily}`
        if (waterMark.italic) {
            fontStyle = "italic " + fontStyle
        }
        if (waterMark.bold) {
            fontStyle = "bold " + fontStyle
        }
        // #ctx.rotate(this.waterMark.rotate * Math.PI / 180);
        ctx.font = fontStyle; //"30px Verdana";
        ctx.fillStyle = "#000000";
        ctx.fillText(waterMark.text, parseInt(waterMark.left * canvas.width / 100), parseInt(canvas.height * waterMark.top / 100));
        // #ctx.rotate(-parseInt(this.waterMark.rotate) * Math.PI / 180);  //坐标系还原#}
    }
}

/**
 *
 * @param file   input[type=file] event.target.files
 * @param callback
 * @param option
 */
function processImg(file, callback, option = {}) {
    const reader = new FileReader();
    var origin_img = new Image()
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    try {
        reader.onload = (e) => {
            origin_img.onload = () => {
                canvas.width = option.width ? option.width : origin_img.width;
                canvas.height = option.height ? option.height : origin_img.height;
                ctx.drawImage(origin_img, 0, 0, canvas.width, canvas.height);
                drawTextWater(canvas, option.textWaterMarkList || [])
                // {#格式转换#}
                canvas.toBlob((blob) => {
                    var newImg = document.createElement("img"),
                        url = URL.createObjectURL(blob);

                    // newImg.onload = function () {
                    //     URL.revokeObjectURL(url);
                    // };
                    newImg.src = url;
                    callback({
                        "file": origin_img,
                        "preview": url, //  event.target.result
                        "origin_format": file.type, // 原始文件格式
                        "origin_width": origin_img.width,// 原始宽度
                        "origin_height": origin_img.height,// 原始高度
                        "format": option.output_format,// 转化后文件格式
                        "width": canvas.width,// 转化后宽度
                        "height": canvas.height,// 转化后高度
                        "name": file.name.replace(/.[^/.]+$/, "." + option.output_format.slice(6).toLowerCase()), //文件名字
                        "originSize": formatFileSize(file.size),
                        "size": formatFileSize(blob.size),
                        "compress": parseInt((file.size - blob.size) * 100 / file.size)  //压缩率
                    })
                }, option.output_format, option.quality); //
            }
            origin_img.setAttribute('src', event.target.result)
        }
        reader.readAsDataURL(file);
    }
    catch (exception) {
        console.log(exception)
    }
}

