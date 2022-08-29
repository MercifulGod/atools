/*
 * License:  The MIT License (MIT) Ryasnoy Paul、todaylg
 * https://github.com/philippica/philippica.github.io
 */

EncodeTool = (function () {
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


    /*
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


    /*
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


    /*
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

    /*
     * 功能:  Unicode 转 中文,GB2312Unicode
     */
    lib.unicodeToZH = function (value) {
        console.log("unicodeToZH", value)
        if (!value) return
        let result = unescape(value.replace(/\\u/gi, '%u'));
        console.log("unicodeToZH", value, result)
        return result
    }

    /*
     * 功能:  中文转Unicode
     */
    lib.zhToUnicode = function (value) {
        console.log("unicodeToZH", value)
        if (!value) return
        let result = escape(value).toLocaleLowerCase().replace(/%u/gi, '\\u');
        console.log("unicodeToZH", value, result)
        return result.replace(/%7b/gi, '{').replace(/%7d/gi, '}').replace(/%3a/gi, ':').replace(/%2c/gi, ',').replace(/%27/gi, '\'').replace(/%22/gi, '"').replace(/%5b/gi, '[').replace(/%5d/gi, ']').replace(/%3D/gi, '=').replace(/%20/gi, ' ').replace(/%3E/gi, '>').replace(/%3C/gi, '<').replace(/%3F/gi, '?');
    }


    /*
 * 功能:  中文转Unicode
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


    /*
 * 功能:  中文转Unicode
 */
    lib.minXML = function (value, preserveComments = true) {
        var str = preserveComments ? value : value.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "")
            .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
        return str.replace(/>\s{0,}</g, "><");
    }


    /**
     * 功能：格式化Json
     * @param preserveComments： 是否保留注释
     * @param indentation： 缩进默认为是个空格
     */
    lib.prettyJson = function (value, preserveComments = true, indentation = "    ") {
        if (typeof JSON === 'undefined') return value;
        if (typeof text === "string") {
            return JSON.stringify(JSON.parse(value), null, this.step);
        }
        if (typeof text === "object") {
            return JSON.stringify(value, null, this.step);
        }
        return value;
    }


    /*
 * 功能:  中文转Unicode
 */
    lib.minJson = function (value) {
        if (typeof JSON === 'undefined') return value;
        return JSON.stringify(JSON.parse(text), null, 0);
    }



    /*
 * 功能:  中文转Unicode
 */
    lib.minCSS = function (value,preserveComments = true) {
        var str = preserveComments ? value : value.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g, "");
        return str.replace(/\s{1,}/g, ' ')
            .replace(/\{\s{1,}/g, "{")
            .replace(/\}\s{1,}/g, "}")
            .replace(/\;\s{1,}/g, ";")
            .replace(/\/\*\s{1,}/g, "/*")
            .replace(/\*\/\s{1,}/g, "*/");
    }

       /*
 * 功能:  中文转Unicode
 */
    lib.minSQL = function (value) {
     return value.replace(/\s{1,}/g, " ").replace(/\s{1,}\(/, "(").replace(/\s{1,}\)/, ")")
    }



    return lib
})()


var EncryencodeTool = {

    /**
     * 设置文本框的值
     * @param idSelector id选择器
     * @param value 值
     */
    resetTextAreaValue: function (objId, value) {
        $('#' + objId).val(value);
        $('#' + objId).trigger("focus");
    },

    exchangeTextAreaValue: function (objId1, objId2) {
        var value1 = $('#' + objId1).val();
        var value2 = $('#' + objId2).val();
        this.resetTextAreaValue(objId1, value2);
        this.resetTextAreaValue(objId2, value1);
    },

    copy: function (btnId, copySourceId) {
        var c1 = new EsjsonClipBoard({
            handlerID: btnId,
            textID: copySourceId
        });
    },

    urlendecodeModule: {

        encode: function () {
            jQuery("#res2").show();
            EncryencodeTool.resetTextAreaValue('targetText', encodeURI(jQuery("#sourceText").val()));
            EncryencodeTool.resetTextAreaValue('targetText2', encodeURIComponent(jQuery("#sourceText").val()));
        },

        decode: function () {
            jQuery("#res2").hide();
            EncryencodeTool.resetTextAreaValue('targetText', decodeURIComponent(jQuery("#sourceText").val()));
        },

        init: function () {
            var _this = this;
            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
                EncryencodeTool.resetTextAreaValue('targetText2', "");
            });

            $("#urlencodeBtn").click(function () {
                _this.encode();
            });

            $("#urldecodeBtn").click(function () {
                _this.decode();
            });
        }
    },

    GB2312UnicodeConverter: {
        ToUnicode: function (str) {
            var txt = escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
            return txt.replace(/%7b/gi, '{').replace(/%7d/gi, '}').replace(/%3a/gi, ':').replace(/%2c/gi, ',').replace(/%27/gi, '\'').replace(/%22/gi, '"').replace(/%5b/gi, '[').replace(/%5d/gi, ']').replace(/%3D/gi, '=').replace(/%20/gi, ' ').replace(/%3E/gi, '>').replace(/%3C/gi, '<').replace(/%3F/gi, '?');
        },
        ToGB2312: function (str) {
            return unescape(str.replace(/\\u/gi, '%u'));
        }
    },

    unicodeModule: {

        init: function () {
            var _this = this;

            //ASCII 转换 Unicode
            $("#asicctounicode").click(function () {
                if (document.getElementById('sourceText').value == '') {
                    layer.msg('文本框中没有代码！');
                    return;
                }
                EncryencodeTool.resetTextAreaValue("targetText", "");
                var result = '';
                for (var i = 0; i < document.getElementById('sourceText').value.length; i++)
                    result += '&#' + document.getElementById('sourceText').value.charCodeAt(i) + ';';
                EncryencodeTool.resetTextAreaValue("targetText", result);
            });
            //Unicode 转换 ASCII
            $("#unicodetoasicc").click(function () {
                var code = document.getElementById('sourceText').value.match(/&#(\d+);/g);
                if (code == null) {
                    layer.msg('文本框中没有合法的Unicode代码！');
                    document.getElementById('sourceText').focus();
                    return;
                }
                EncryencodeTool.resetTextAreaValue("targetText", "");
                var result = '';
                for (var i = 0; i < code.length; i++)
                    result += String.fromCharCode(code[i].replace(/[&#;]/g, ''));
                EncryencodeTool.resetTextAreaValue("targetText", result);

            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#untozhBtn").click(function () {
                var _this = this;
                var txtA = document.getElementById("sourceText");
                var text = txtA.value.trim();
                if (!text) {
                    layer.msg("请输入要转换的字符串。");
                    return false;
                }
                EncryencodeTool.resetTextAreaValue("targetText", EncryencodeTool.GB2312UnicodeConverter.ToGB2312(text));
            });

            $("#zhtounBtn").click(function () {
                var _this = this;
                var txtA = document.getElementById("sourceText");
                var text = txtA.value.trim();
                if (!text) {
                    layer.msg("请输入要转换的字符串。");
                    return false;
                }
                EncryencodeTool.resetTextAreaValue("targetText", EncryencodeTool.GB2312UnicodeConverter.ToUnicode(text));
            });

            $("#zhtoenBtn").click(function () {

                var txtA = document.getElementById("sourceText");
                var str = txtA.value.trim();
                if (!str) {
                    layer.msg("请输入要转换的字符串。");
                    return false;
                }

                str = str.replace(/\’|\‘/g, "'").replace(/\“|\”/g, "\"");
                str = str.replace(/\【/g, "[").replace(/\】/g, "]").replace(/\｛/g, "{").replace(/\｝/g, "}");
                str = str.replace(/，/g, ",").replace(/：/g, ":");

                EncryencodeTool.resetTextAreaValue("targetText", str);
            });

        }
    },

    utf8Module: function () {
        $("#zhtoutf8Btn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', $("#sourceText").val().replace(/[^\u0000-\u00FF]/g, function ($0) {
                return escape($0).replace(/(%u)(\w{4})/gi, "&#x$2;")
            }));

        });
        $("#utf8tozhBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', unescape($("#sourceText").val().replace(/&#x/g, '%u').replace(/;/g, '')));
        });

        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
            // EncryencodeTool.resetTextAreaValue('targetText', "");
        });
    },

    ipConvertModule: function () {
        $("#toInt").click(function () {
            var ip = $("#sourceText").val();
            ip = ip.split(".");
            num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
            num = num >>> 0;
            // document.getElementById('result').value = num;
            EncryencodeTool.resetTextAreaValue('sourceText', num);
        });
        $("#toIp").click(function () {

            var num = $("#sourceText").val();
            var tt = new Array();
            tt[0] = (num >>> 24) >>> 0;
            tt[1] = ((num << 8) >>> 24) >>> 0;
            tt[2] = (num << 16) >>> 24;
            tt[3] = (num << 24) >>> 24;
            str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
            // document.getElementById('result').value = str;

            EncryencodeTool.resetTextAreaValue('sourceText', str);

        });

        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
            // EncryencodeTool.resetTextAreaValue('targetText', "");
        });

        EncryencodeTool.copy('copy-btn', "sourceText");
        // EncryencodeTool.resetTextAreaValue('targetText', "");
    },
    nativeAsciiModule: function () {
        $("#native2asciiBtn").click(function () {
            var nativecode = document.getElementById("sourceText").value.split("");
            var ascii = "";
            for (var i = 0; i < nativecode.length; i++) {
                var code = Number(nativecode[i].charCodeAt(0));
                if (!document.getElementById("ignoreLetter").checked || code > 127) {
                    var charAscii = code.toString(16);
                    charAscii = new String("0000").substring(charAscii.length, 4) + charAscii;
                    ascii += "\\u" + charAscii;
                } else {
                    ascii += nativecode[i];
                }
            }
            // console.log(ascii);
            EncryencodeTool.resetTextAreaValue('sourceText', ascii);
        });

        $("#ascii2nativeBtn").click(function () {
            var asciicode = document.getElementById("sourceText").value.split("\\u");
            var nativeValue = asciicode[0];
            for (var i = 1; i < asciicode.length; i++) {
                var code = asciicode[i];
                nativeValue += String.fromCharCode(parseInt("0x" + code.substring(0, 4)));
                if (code.length > 4) {
                    nativeValue += code.substring(4, code.length);
                }
            }
            // console.log(nativeValue);
            EncryencodeTool.resetTextAreaValue('sourceText', nativeValue);
        });
        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
        });
    },


    unixtimeModule: {
        currentTimeActive: 1,
        unixTimer: 0,
        unix2human: function () {
            var isms = $("#unixtoutc8sel").val();
            var v = document.unix.timestamp.value;
            if (isms == 0) {
                if (/^(-)?\d{1,10}$/.test(v)) {
                    v = v * 1000;
                } else if (/^(-)?\d{1,13}$/.test(v)) {
                    v = v * 1000;
                } else if (/^(-)?\d{1,14}$/.test(v)) {
                    v = v * 100;
                } else if (/^(-)?\d{1,15}$/.test(v)) {
                    v = v * 10;
                } else if (/^(-)?\d{1,16}$/.test(v)) {
                    v = v * 1;
                } else {
                    layer.msg("时间戳格式不正确");
                    return;
                }
            } else {
                v = v * 1;
            }

            var dateObj = new Date(v);
            if (dateObj.format('yyyy') == "NaN") {
                return;
            }
            // var UnixTimeToDate = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + ' ' + dateObj.getHours() + ':' + dateObj.getMinutes() + ':' + dateObj.getSeconds();
            document.unix.unixtoutc8result.value = dateObj.format("yyyy-MM-dd hh:mm:ss");
        },
        /* human2unix: function () {
             var isms = $("#utc8tounixsel").val();
             var _this = EncryencodeTool.unixtimeModule;
             var form = document.unix;
             var year = form.year.value;
             if (!year) { /!*alert("时间格式不正确");*!/
                 return;
             }
             var month = _this.stripLeadingZeroes(form.month.value);
             var day = _this.stripLeadingZeroes(form.day.value);
             var hour = _this.stripLeadingZeroes(form.hour.value);
             var minute = _this.stripLeadingZeroes(form.minute.value);
             var second = _this.stripLeadingZeroes(form.second.value);
             year = year ? year : new Date().getFullYear(), month = month ? month : 1, day = day ? day : 1, hour = hour ? hour : (year == 1970 ? 0 : 0), minute = minute ? minute : 0, second = second ? second : 0;
             //var humanDate = new Date(Date.UTC(year, month, day, hour, minute, second));

             var humanDate = new Date(year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second);
             if (humanDate.format('yyyy') == "NaN") { /!*alert("时间格式不正确");*!/
                 return;
             }
             if (isms == 0) document.unix.utc8tounixresult.value = (humanDate.getTime() / 1000);
             else document.unix.utc8tounixresult.value = humanDate.getTime();
         },*/
        human2unix: function () {
            var isms = $("#utc8tounixsel").val();
            var _this = EncryencodeTool.unixtimeModule;
            var form = document.unix;
            var datetime = form.utc8.value;
            if (!datetime) return;
            var ndate = new Date(datetime);
            var year = ndate.getFullYear();
            var month = ndate.getMonth();
            var day = ndate.getDate();
            var hour = ndate.getHours();
            var minute = ndate.getMinutes();
            var second = ndate.getSeconds();
            var ms = ndate.getMilliseconds();
            //var humanDate = new Date(Date.UTC(year, month, day, hour, minute, second));
            var humanDate;
            if (isms == 0) humanDate = new Date(year, month, day, hour, minute, second);
            else humanDate = new Date(year, month, day, hour, minute, second, ms);
            if (humanDate.format('yyyy') == "NaN") { /*alert("时间格式不正确");*/
                return;
            }
            if (isms == 0) form.utc8tounixresult.value = (humanDate.getTime() / 1000);
            else form.utc8tounixresult.value = humanDate.getTime();
        },
        stripLeadingZeroes: function (input) {
            if ((input.length > 1) && (input.substr(0, 1) == "0")) {
                return input.substr(1);
            } else {
                return input;
            }
        },
        currentTime: function () {
            var _this = EncryencodeTool.unixtimeModule;
            var timeNow = new Date();
            // document.getElementById("curunixtime").value = Math.round(timeNow.getTime() / 1000);
            document.getElementById("curunixtime").value = Math.round(timeNow.getTime());
            if (_this.currentTimeActive) {
                this.unixTimer = setTimeout(function () {
                    _this.currentTime()
                }, 1000);
            }
        },
        /* nowDate: function () {
             var form = document.unix;
             var timeNow = new Date();
             /!* form.timestamp.value = Math.round(timeNow.getTime() / 1000);
              form.year.value = timeNow.getFullYear();*!/
             //                form.month.value = timeNow.getMonth() + 1;
             //                form.day.value = timeNow.getDate();
             //                form.hour.value = timeNow.getHours();
             //                form.minute.value = timeNow.getMinutes();
             //                form.second.value = timeNow.getSeconds();
         },*/
        init: function () {
            var _this = this;
            // _this.nowDate();
            _this.currentTime();
            var initDate = new Date();
            document.getElementById("timestamp").value = Math.round(initDate.getTime());
            document.getElementById("utc8").value = initDate.format("yyyy-MM-dd hh:mm:ss");
            $("#nowStartBtn").click(function () {
                _this.currentTimeActive = 1;
                _this.currentTime();
            });
            $("#nowStopBtn").click(function () {
                _this.currentTimeActive = 0;
                clearTimeout(_this.unixTimer);
            });
            $("#nowRefreshBtn").click(_this.currentTime);

            $("#unixtoutc8").click(function () {
                _this.unix2human()
            });
            $("#utc8tounix").click(_this.human2unix);
        }
    },

    textEncryptModule: {

        commonEncrypt: function (sourceId, targetId, encryptType, encryPwdId) {
            var v = encryptType;
            if (!v) return;

            var sourceText = $("#" + sourceId).val();
            var encryPwd = $("#" + encryPwdId).val();


            switch (v) {
                case "aes":
                    resetTextAreaValue(targetId, CryptoJS.AES.encrypt(sourceText, encryPwd));
                    break;
                case "des":
                    resetTextAreaValue(targetId, CryptoJS.DES.encrypt(sourceText, encryPwd));
                    break;
                case "rabbit":
                    resetTextAreaValue(targetId, CryptoJS.Rabbit.encrypt(sourceText, encryPwd));
                    break;
                case "rc4":
                    resetTextAreaValue(targetId, CryptoJS.RC4.encrypt(sourceText, encryPwd));
                    break;
                case "tripledes":
                    resetTextAreaValue(targetId, CryptoJS.TripleDES.encrypt(sourceText, encryPwd));
                    break;
            }
        },

        commonDecrypt: function (sourceId, targetId, encryptType, encryPwdId) {
            var sourceText = $("#" + sourceId).val();
            var encryPwd = $("#" + encryPwdId).val();

            switch (encryptType) {
                case "aes":
                    resetTextAreaValue(targetId, CryptoJS.AES.decrypt(sourceText, encryPwd).toString(CryptoJS.enc.Utf8));
                    break;
                case "des":
                    resetTextAreaValue(targetId, CryptoJS.DES.decrypt(sourceText, encryPwd).toString(CryptoJS.enc.Utf8));
                    break;
                case "rabbit":
                    resetTextAreaValue(targetId, CryptoJS.Rabbit.decrypt(sourceText, encryPwd).toString(CryptoJS.enc.Utf8));
                    break;
                case "rc4":
                    resetTextAreaValue(targetId, CryptoJS.RC4.decrypt(sourceText, encryPwd).toString(CryptoJS.enc.Utf8));
                    break;
                case "tripledes":
                    resetTextAreaValue(targetId, CryptoJS.TripleDES.decrypt(sourceText, encryPwd).toString(CryptoJS.enc.Utf8));
                    break;
            }
        },

        textEncrpt: function () {
            $("#encryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonEncrypt('sourceText', 'sourceText', $("#encryptType").val(), 'pwd');
            });
            $("#decryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonDecrypt('sourceText', 'sourceText', $("#encryptType").val(), 'pwd');
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
            });
        },

        aesEncrpt: function () {
            $("#encryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonEncrypt('sourceText', 'targetText', 'aes', 'pwd');
            });
            $("#decryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonDecrypt('sourceText', 'targetText', 'aes', 'pwd');
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#exchangeBtn").click(function () {
                EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
            });
        },

        desEncrpt: function () {
            $("#encryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonEncrypt('sourceText', 'targetText', 'des', 'pwd');
            });
            $("#decryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonDecrypt('sourceText', 'targetText', 'des', 'pwd');
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#exchangeBtn").click(function () {
                EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
            });
        },

        rc4Encrpt: function () {
            $("#encryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonEncrypt('sourceText', 'targetText', 'rc4', 'pwd');
            });
            $("#decryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonDecrypt('sourceText', 'targetText', 'rc4', 'pwd');
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#exchangeBtn").click(function () {
                EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
            });
        },

        rabbitEncrpt: function () {
            $("#encryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonEncrypt('sourceText', 'targetText', 'rabbit', 'pwd');
            });
            $("#decryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonDecrypt('sourceText', 'targetText', 'rabbit', 'pwd');
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#exchangeBtn").click(function () {
                EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
            });
        },

        tripleDesEncrpt: function () {
            $("#encryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonEncrypt('sourceText', 'targetText', 'tripledes', 'pwd');
            });
            $("#decryBtn").click(function () {
                EncryencodeTool.textEncryptModule.commonDecrypt('sourceText', 'targetText', 'tripledes', 'pwd');
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#exchangeBtn").click(function () {
                EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
            });
        },

        md5Encrpt: function () {
            $("#encryBtn1").click(function () {
                var value = CryptoJS.MD5($("#sourceText").val());
                EncryencodeTool.resetTextAreaValue('targetText', value);
            });

            $("#encryBtn2").click(function () {
                var value = CryptoJS.MD5($("#sourceText").val()).toString();
                EncryencodeTool.resetTextAreaValue('targetText', value.toUpperCase());
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });
        },
        url16Encrpt: function () {
            $("#encryBtn1").click(function () {
                var str2 = '';
                str = $('#sourceText').val();
                str3 = str.substring(0, 7);
                if (str3 == 'http://') {
                    str2 = 'http://';
                    str = str.substring(7, str.length);
                }
                for (i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) == '47') str2 += '/';
                    else if (str.charCodeAt(i) == '63') str2 += '?';
                    else if (str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57) str2 += str[i];
                    else if (str.charCodeAt(i) == '37') str2 += '%';
                    else if (str.charCodeAt(i) == '38') str2 += '&';
                    else if (str.charCodeAt(i) == '61') str2 += '=';
                    else if (str.charCodeAt(i) == '58') str2 += ':';
                    else if (str.charCodeAt(i) == '95') str2 += '_';
                    else str2 += '%' + str.charCodeAt(i).toString(16);
                }
                EncryencodeTool.resetTextAreaValue('targetText', str2);
            });

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });
        },

        hashEncrpt: {
            setHash: function (type, val, pwd) {
                switch (type) {
                    case "sha1":
                        $("#pwdDiv").addClass("layui-hide")
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.SHA1(val));
                        break;
                    case "sha224":
                        $("#pwdDiv").addClass("layui-hide")
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.SHA224(val));
                        break;
                    case "sha256":
                        $("#pwdDiv").addClass("layui-hide")
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.SHA256(val));
                        break;
                    case "sha384":
                        $("#pwdDiv").addClass("layui-hide")
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.SHA384(val));
                        break;
                    case "sha512":
                        $("#pwdDiv").addClass("layui-hide")
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.SHA512(val));
                        break;
                    case "md5":
                        $("#pwdDiv").addClass("layui-hide")
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.MD5(val));
                        break;
                    case "hmacsha1":
                        $("#pwdDiv").removeClass("layui-hide");
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.HmacSHA1(val, pwd));
                        break;
                    case "hmacsha224":
                        $("#pwdDiv").removeClass("layui-hide");
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.HmacSHA224(val, pwd));
                        break;
                    case "hmacsha256":
                        $("#pwdDiv").removeClass("layui-hide");
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.HmacSHA256(val, pwd));
                        break;
                    case "hmacsha384":
                        $("#pwdDiv").removeClass("layui-hide");
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.HmacSHA384(val, pwd));
                        break;
                    case "hmacsha512":
                        $("#pwdDiv").removeClass("layui-hide");
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.HmacSHA512(val, pwd));
                        break;
                    case "hmacmd5":
                        $("#pwdDiv").removeClass("layui-hide");
                        EncryencodeTool.resetTextAreaValue('targetText', CryptoJS.HmacMD5(val, pwd));
                        break;
                }
            },
            init: function () {
                var _this = this;
                $("#encryBtns .encryptBtn").click(function () {
                    var val = $("#sourceText").val();
                    var pwd = $("#pwd").val();
                    if (val) {
                        _this.setHash($(this).attr("t"), val, pwd);
                    }
                });
                $("#clearBtn").click(function () {
                    EncryencodeTool.resetTextAreaValue('sourceText', "");
                    EncryencodeTool.resetTextAreaValue('targetText', "");
                });
            }
        },

        morseEncrpt: function () {

            $("#encryBtn").click(function () {
                var v = $("#sourceText").val();
                if (!v) return;

                resetTextAreaValue('sourceText', morse.encode(v));
            });

            $("#decryBtn").click(function () {
                var v = $("#sourceText").val();
                resetTextAreaValue('sourceText', morse.decode(v));
            });


            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                // EncryencodeTool.resetTextAreaValue('targetText', "");
            });
        }


    },

    scriptEncode: function () {
        $("#encryBtn").click(function () {
            var v = $("#sourceText").val();
            if (!v) return;
            var es = escape(v);
            resetTextAreaValue('targetText', "document.write(unescape('{0}'));".format(es));
        });
        $("#decryBtn").click(function () {
            var v = $("#sourceText").val();
            var regex = /unescape\('([a-z%0-9].*)'\)/i;
            if (v.match(regex)) {
                // getid('ipt').value = unescape(RegExp.$1);
                resetTextAreaValue('targetText', unescape(RegExp.$1));
            }
        });
        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
            EncryencodeTool.resetTextAreaValue('targetText', "");
        });

        $("#exchangeBtn").click(function () {
            EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
        });
    },

    jsCodeConfusion: function () {
        $("#encryBtn").click(function () {
            var code = document.getElementById("sourceText").value;
            var xx = new CLASS_CONFUSION(code);
            var a = new Date();
            EncryencodeTool.resetTextAreaValue('targetText', xx.confusion());
        });

        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
            EncryencodeTool.resetTextAreaValue('targetText', "");
        });
    },

    jsCodeEvalConfusion: {
        encode: function () {
            var a = 62;
            var code = document.getElementById('sourceText').value;
            code = code.replace(/[\r\n]+/g, '');
            code = code.replace(/'/g, "\\'");
            var tmp = code.match(/\b(\w+)\b/g);
            tmp.sort();
            var dict = [];
            var i, t = '';
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i] != t) dict.push(t = tmp[i]);
            }
            var len = dict.length;
            var ch;
            for (i = 0; i < len; i++) {
                ch = EncryencodeTool.jsCodeEvalConfusion.num(i);
                code = code.replace(new RegExp('\\b' + dict[i] + '\\b', 'g'), ch);
                if (ch == dict[i]) dict[i] = '';
            }

            EncryencodeTool.resetTextAreaValue('targetText', "eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}("
                + "'" + code + "'," + a + "," + len + ",'" + dict.join('|') + "'.split('|'),0,{}))");
        },

        num: function (c) {
            var a = 62;
            return (c < a ? '' : this.num(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
        },

        decode: function () {
            var code = document.getElementById('sourceText').value;
            code = code.replace(/^eval/, '');
            // document.getElementById('code').value = eval(code);
            EncryencodeTool.resetTextAreaValue('targetText', eval(code));
        },

        init: function () {
            $("#encryBtn").click(this.encode);
            $("#decryBtn").click(this.decode);

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });
        }
    },

    base64: {

        encode: function () {
            // var encode = $("#encode").val();
            // if(encode==1){
            var str = CryptoJS.enc.Utf8.parse($("#sourceText").val());
            var base64 = CryptoJS.enc.Base64.stringify(str);
            // }else{
            //     var str = jQuery("#content").val();
            //     var base64 = encode64gb2312(str);
            // }
            EncryencodeTool.resetTextAreaValue('targetText', base64);
        },

        decode: function () {
            var words = CryptoJS.enc.Base64.parse($("#sourceText").val());
            // jQuery("#result").val(words.toString(CryptoJS.enc.Utf8));
            EncryencodeTool.resetTextAreaValue('targetText', words.toString(CryptoJS.enc.Utf8));


        },

        init: function () {

            $("#encryBtn").click(this.encode);
            $("#decryBtn").click(this.decode);

            $("#clearBtn").click(function () {
                EncryencodeTool.resetTextAreaValue('sourceText', "");
                EncryencodeTool.resetTextAreaValue('targetText', "");
            });

            $("#exchangeBtn").click(function () {
                EncryencodeTool.exchangeTextAreaValue('sourceText', "targetText");
            });
        }

    },

    escapeModule: function () {

        $("#encryBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', escape($("#sourceText").val()));
        });

        $("#decryBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', unescape($("#sourceText").val()));
        });

        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
        });

    },

    toPinyinModule: function () {
        $("#purepyBtn").click(function () {
            var sourcetext = $("#sourceText").val();
            var str = '';
            var s;
            for (var i = 0; i < sourcetext.length; i++) {
                if (pydic.indexOf(sourcetext.charAt(i)) != -1 && sourcetext.charCodeAt(i) > 200) {
                    s = 1;
                    while (pydic.charAt(pydic.indexOf(sourcetext.charAt(i)) + s) != ",") {
                        str += pydic.charAt(pydic.indexOf(sourcetext.charAt(i)) + s);
                        s++;
                    }
                    str += " ";
                } else {
                    str += sourcetext.charAt(i);
                }
            }
            EncryencodeTool.resetTextAreaValue('targetText', str);
        });

        $("#pyandcnBtn").click(function () {
            var sourcetext = $("#sourceText").val();
            var str = '';
            var s;
            for (var i = 0; i < sourcetext.length; i++) {
                if (pydic.indexOf(sourcetext.charAt(i)) != -1 && sourcetext.charCodeAt(i) > 200) {
                    s = 1;
                    while (pydic.charAt(pydic.indexOf(sourcetext.charAt(i)) + s) != ",") {
                        str += pydic.charAt(pydic.indexOf(sourcetext.charAt(i)) + s);
                        s++;
                    }
                    str += sourcetext.charAt(i) + " ";
                } else {
                    str += sourcetext.charAt(i);
                }
            }

            EncryencodeTool.resetTextAreaValue('targetText', str);
        });

        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
        });

        EncryencodeTool.copy('copy-btn', 'targetText');

    },
    jianFanTiModule: function () {
        $("#jiantiBtn").click(function () {
            var sourceText = $('#sourceText').val();
            var str = '';
            for (var i = 0; i < sourceText.length; i++) {
                if (ftPYStr().indexOf(sourceText.charAt(i)) != -1) {
                    str += charPYStr().charAt(ftPYStr().indexOf(sourceText.charAt(i)));
                } else {
                    str += sourceText.charAt(i);
                }
            }
            EncryencodeTool.resetTextAreaValue('sourceText', str);
        });

        $("#fantiBtn").click(function () {
            var sourceText = $('#sourceText').val();
            var str = '';
            for (var i = 0; i < sourceText.length; i++) {
                if (charPYStr().indexOf(sourceText.charAt(i)) != -1) {

                    str += ftPYStr().charAt(charPYStr().indexOf(sourceText.charAt(i)));
                }
                else {
                    str += sourceText.charAt(i);
                }
            }
            EncryencodeTool.resetTextAreaValue('sourceText', str);
        });

        $("#clearBtn").click(function () {
            EncryencodeTool.resetTextAreaValue('sourceText', "");
        });

        EncryencodeTool.copy('copy-btn', 'sourceText');

    },
    rmbDaxieModule: function () {
        var hzf = "零壹贰叁肆伍陆柒捌玖";
        $("#toDxBtn").click(function () {
            var str = $('#alb').val();
            var res = "";
            for (var i = 0; i < str.length; i++) {
                var num = str.charAt(i);
                if (num == ".") {
                    res += "点";
                } else {
                    res += hzf.charAt(parseInt(num));
                }
            }
            EncryencodeTool.resetTextAreaValue('albdaxie', res);
        });

        $("#toXxBtn").click(function () {
            var str = $('#albdaxie').val();
            var numstr = "";
            var length = str.length;
            for (var i = 0; i < length; i++) {
                var numhz = str.charAt(i);

                var num = hzf.indexOf(numhz);
                if (num != -1) {
                    str = str.replace(numhz, num);
                    numstr += num;
                } else {
                    if (numhz == "元" || numhz == "圆" || numhz == "点") {
                        numstr += ".";
                    }
                }
            }
            EncryencodeTool.resetTextAreaValue('alb', numstr);
        });

        EncryencodeTool.copy('copy1Btn', 'alb');
        EncryencodeTool.copy('copy2Btn', 'albdaxie');

    }


}


var esFormat = function esFormat() {
};
esFormat.jsFormat = function () {
    var c1 = new EsjsonClipBoard({
        handlerID: 'copy-btn',
        textID: 'targetText',
        isAttr: false,
        type: 'copy'
    });
    // c1.attach();
    $("#jsBeautyBtn").click(function () {
        let js_source = document.getElementById('sourceText').value.replace(/^\s+/, '');
        let tabsize = document.getElementById('tabsize').value;
        let tabchar = ' ';
        if (tabsize == 1) {
            tabchar = '\t';
        }
        var regEmptyTag = /(<([^\/][^>|^\/>].*)>)(\s*)?(<\/([^>]*)>)/g;
        var c = "";
        if (js_source && js_source.charAt(0) === '<') {
            c = style_html(js_source, tabsize, tabchar, 80);
        } else {
            c = js_beautify(js_source, tabsize, tabchar);
        }
        resetTextAreaValue("targetText", c.replace(regEmptyTag, '$1$4'));
        return false;
    });
    $("#jsysBtn").click(function (base64) {
        pack_js(0);
    });
    $("#jsEncryptysBtn").click(function (base64) {
        pack_js(1);
    });
    $("#clearBtn").click(function () {
        resetTextAreaValue("targetText", "");
        resetTextAreaValue("sourceText", "");
    });

    function pack_js(base64) {
        var input = document.getElementById('sourceText').value;
        var packer = new Packer;
        if (base64) {
            var output = packer.pack(input, 1, 0);
        } else {
            var output = packer.pack(input, 0, 0);
        }
        resetTextAreaValue("targetText", output);
    }

};

esFormat.htmlFormat = esFormat.jsFormat;

esFormat.cssFormat = function () {
    var c1 = new EsjsonClipBoard({
        handlerID: 'copy-btn',
        textID: 'sourceText',
        isAttr: false,
        type: 'copy'
    });
    // c1.attach();
    $("#cssPrettyBtn").on('click', function () {
        $("#sourceText").format({method: 'css'});
    });
    $("#cssminBtn").on('click', function () {
        $("#sourceText").format({method: 'cssmin'});
    });
    $("#clearBtn").click(function () {
        resetTextAreaValue("sourceText", "");
    });

    $("#clearBtn").click(function () {
        resetTextAreaValue("sourceText", "");
    });
};

esFormat.xmlFormat = function () {
    var c1 = new EsjsonClipBoard({
        handlerID: 'copy-btn',
        textID: 'sourceText',
        isAttr: false,
        type: 'copy'
    });
    // c1.attach();
    $("#xmlPrettyBtn").on('click', function () {
        $("#sourceText").format({method: 'xml'});
    });
    $("#xmlminBtn").on('click', function () {
        $("#sourceText").format({method: 'xmlmin'});
    });
    $("#clearBtn").click(function () {
        resetTextAreaValue("sourceText", "");
    });

    $("#clearBtn").click(function () {
        resetTextAreaValue("sourceText", "");
    });
};

esFormat.sqlFormat = function () {
    var c1 = new EsjsonClipBoard({
        handlerID: 'copy-btn',
        textID: 'sourceText',
        isAttr: false,
        type: 'copy'
    });
    // c1.attach();
    $("#sqlPrettyBtn").on('click', function () {
        $("#sourceText").format({method: 'sql'});
    });
    $("#sqlminBtn").on('click', function () {
        $("#sourceText").format({method: 'sqlmin'});
    });
    $("#clearBtn").click(function () {
        resetTextAreaValue("sourceText", "");
    });
    $("#clearBtn").click(function () {
        resetTextAreaValue("sourceText", "");
    });
};


