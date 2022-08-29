//cookie
function setCookie(name, value) {
    var Days = 360;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = escape(name) + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + escape(name) + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

function zyd_show() {
    /* 显示 */
    //document.querySelector(".zdy").style.display="block";
    $(".zdy_name").val("");
    $(".zdy_link").val("");

    if ($(".zdy_button").attr("data") == "1") {
        $(".i_r_edit").hide();
        $(".zdy_button").attr("data", "0");
    } else {
        $(".i_r_edit").show();
        $(".zdy_button").attr("data", "1");
    }
}

function zdy_close() {
    /* 隐藏 */
    document.querySelector(".zdy").style.display = "none";
    $(".i_r_edit").hide();
}

//取消
function zdy_false() {
    /* 隐藏 */
    document.querySelector(".zdy").style.display = "none";
    $(".i_r_edit").hide();
}

function zyd_edit(index) {
    /* 显示 */
    document.querySelector(".zdy").style.display = "block";
    var that = $($($(".jj-list-con li")[index]).children("a"));
    $(".zdy_name").val(that.html());
    $(".zdy_link").val(that.attr("href"));
    //$(".i_r_edit").show();
    $(".zdy").attr("date", index);
}

//确定
function zdy_true() {
    $(".i_r_edit").hide();
    /* 隐藏 */
    document.querySelector(".zdy").style.display = "none";
    var name = $(".zdy_name").val();
    var link = $(".zdy_link").val();
    var index = $(".zdy").attr("date");
    //console.log(name,link);
    setCookie("zdylink_" + index, name + "_fg_" + link);
    c_init();

}


function c_init() {
    //$(".zdy_li").empty();

    var aCookie = document.cookie.split(";");

    var zdylength = 0;
    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (aCrumb[0].toString().trim() == 'order_list') {
            continue;
        }
        var name = unescape(aCrumb[0].trim());

        if (aCrumb[0].toString().trim().indexOf("zdylink_") > -1) {

            zdylength = zdylength + 1;
            var l_l_edit = $(".jj-list-con li")[name.replace("zdylink_", "")];
            if (l_l_edit) {

                var link = getCookie(name).split("_fg_");

                $($(l_l_edit).children("a")).attr("href", link[1]);
                $($(l_l_edit).children("a")).html(link[0]);
            }
            //$(".zdy_li").append('<li><a href="'+link +'" class="link-3" target="_blank">'+(name.replace("zdylink_",""))+'</a><div class="i_r_remove" onclick="s_r(\''+aCrumb[0]+'\');"></div></li>');
        }

    }
    if (zdylength == 0) {
        //$(".zdy_list").hide();
    } else {
        //$(".zdy_list").show();
    }

}

function s_r(key) {
    delCookie(key.trim());
    //c_init();
}

window.onload = function () {
    c_init();
    var list_li = $("._b li");
    for (var i = list_li.length - 1; i >= 0; i--) {
        $(list_li[i]).append('<div class="i_r_edit" onclick="zyd_edit(\'' + i + '\');"></div>');
    }

}

$(function () {
    // $('body').height($('body')[0].clientHeight);
    initpage();
    $(window).resize(function () {
        initpage();
    })

    function initpage() {
        var view_width = document.getElementsByTagName('html')[0].getBoundingClientRect().width;
        var _html = document.getElementsByTagName('html')[0];
        view_width > 640 ? _html.style.fontSize = 640 / 16 + 'px' : _html.style.fontSize = view_width / 16 + 'px';
    }
});

var sllTop;
var divsTop = 330;
/*document.getElementsByClassName('content')[0].offsetTop; 获取当前对象到其上级层顶部的距离*/
window.onscroll = function () {
    var onBtn = document.getElementById('top-box');
    sllTop = document.documentElement.scrollTop || document.body.scrollTop;//如果浏览器不支持第一个事件则选择第二

    if (sllTop >= 40) {
        $('.header-con').css('padding', '0');
        $('.logo img').css({'width': '50', 'margin-top': '5px', 'margin-left': '10px'});
    } else {
        $('.header-con').css('padding', '10px 0');
        $('.logo img').css({'width': '60', 'margin-top': '0px', 'margin-left': '0px'});
    }

    if (sllTop > 240) {
        $('#tbox2').css('display', 'block')
    } else {
        $('#tbox2').css('display', 'none');
    }
    if (sllTop >= divsTop) {
        $('.left-list').css('position', 'fixed');
    } else {
        $('.left-list').css('position', '');
    }
    tlistTop();

};

$(function () {
    $(".taoba").click(function (event) {
        var i = $(this).index();
        var id = $('.dingwei')[i];
        $("html,body").animate({scrollTop: $(id).offset().top - 80}, 800);
    });


    $(".list-text").click(function (event) {
        var i2 = $(this).index();
        var id2 = $('.sethome-con')[i2];
        $("html,body").animate({scrollTop: $(id2).offset().top - 80}, 800);
    });
});

function tlistTop() {
    var sethome_conHeight;
    var tihsHeight;
    var list_text = document.getElementsByClassName('fa-caret-right');
    if (list_text.length === 0) {
        return false;  //如果匹配到0个元素，则将函数返回，不继续执行
    }
    arr1 = []; //存储元素的top距离页面顶部的高度
    for (var i = 0; i <= 4; i++) {
        thisHeight = document.getElementsByClassName('sethome-con')[i].offsetTop + divsTop - 80;
        arr1.push(thisHeight); //将循环获取到的值添加到数组里面
    }

    if (sllTop >= arr1[0]) {
        list_text[0].style.opacity = 1;
        list_text[1].style.opacity = 0;
        list_text[2].style.opacity = 0;
        list_text[3].style.opacity = 0;
        list_text[4].style.opacity = 0;
    }
    if (sllTop >= arr1[1]) {
        list_text[0].style.opacity = 0;
        list_text[1].style.opacity = 1;
        list_text[2].style.opacity = 0;
        list_text[3].style.opacity = 0;
        list_text[4].style.opacity = 0;
    }
    if (sllTop >= arr1[2]) {
        list_text[0].style.opacity = 0;
        list_text[1].style.opacity = 0;
        list_text[2].style.opacity = 1;
        list_text[3].style.opacity = 0;
        list_text[4].style.opacity = 0;
    }
    if (sllTop >= arr1[3]) {
        list_text[0].style.opacity = 0;
        list_text[1].style.opacity = 0;
        list_text[2].style.opacity = 0;
        list_text[3].style.opacity = 1;
        list_text[4].style.opacity = 0;
    }
    if (sllTop >= arr1[4]) {
        list_text[0].style.opacity = 0;
        list_text[1].style.opacity = 0;
        list_text[2].style.opacity = 0;
        list_text[3].style.opacity = 0;
        list_text[4].style.opacity = 1;
    }
}

$('#gotop').click(function () {
    $('body,html').animate({
            scrollTop: 0
        },
        800);//点击回到顶部按钮，缓懂回到顶部,数字越小越快
})


/*选择搜索引擎*/
$('.Select-box ul').hover(function () {
    $(this).css('height', 'auto')
}, function () {
    $(this).css('height', '40px')
});
$('.Select-box-2 ul').hover(function () {
    $(this).css('height', 'auto')
}, function () {
    $(this).css('height', '47px')
});

$('.Select-box-2 li').click(function () {
    var _tihs = $(this).attr('class');
    var _html = $(this).html();
    var _name = 'q';
    if (_tihs == 'this_s') {
        return "";
    }
    if (_tihs == 'ff_s') {
        _tihs = 'https://fsoufsou.com/search';
        _name = 'q';
    } else if (_tihs == 'google_s') {
        _tihs = 'https://www.google.com/search';
        _name = 'q';
    } else if (_tihs == 'bing_s') {
        _tihs = 'https://www.bing.com/search';
        _name = 'q';
    } else if (_tihs == 'miji_s') {
        _tihs = 'https://duckduckgo.com/';
        _name = 'q';
    } else if (_tihs == 'baidu_s') {
        _tihs = 'https://www.baidu.com/s';
        _name = 'wd';
    }
    else {
        _tihs = 'https://fsoufsou.com/search';
        _name = 'q';
    }
    $('.baidu form').attr('action', _tihs);
    $('.this_s').html(_html);
    $('#kw-2').attr('name', _name);
    $('.Select-box-2 ul').css('height', '48px');

    setCookie("_search_", _html + "_nln_" + _tihs + "_nln_" + _name);
});

function _search_() {
    var aCookie = document.cookie.split(";");

    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (aCrumb[0].toString().trim() == 'order_list') {
            continue;
        }
        var name = unescape(aCrumb[0].trim());

        if (aCrumb[0].toString().trim().indexOf("_search_") > -1) {

            var link = getCookie(name).split("_nln_");

            $('.baidu form').attr('action', link[1]);
            $('.this_s').html(link[0]);
            $('#kw-2').attr('name', link[2]);
            $('.Select-box-2 ul').css('height', '48px');
        }

    }

}

_search_();

//清空输入框内容
$('.qingkong').click(function () {
    cls();
    $(this).css('display', 'none')
});

function cls() {
    var sum = 0;
    var t = document.getElementsByTagName("INPUT");
    for (var i = 0; i < t.length; i++) {
        if (t[i].type == 'text') {
            ++sum;
            t[i].value = "";//清空
        }
    }
}

//清空输入框按钮的显示和隐藏
function if_btn() {
    var btn_obj = document.getElementById("kw") || document.getElementById("kw-2");
    var cls_btn = document.getElementById("qingkong");
    var btn_obj_val;
    var times;
    //当元素获得焦点时
    if (btn_obj == '' || btn_obj == null) {
        return false;  //如果没有找到这个元素，则将函数返回，不继续执行
    }
    btn_obj.onfocus = function () {
        times = setInterval(function () {
            btn_obj_val = btn_obj.value;
            if (btn_obj_val != 0) {
                cls_btn.style.display = "block";
            } else {
                cls_btn.style.display = "none";
            }
        }, 200);
    }
    //元素失去焦点时
    btn_obj.onblur = function () {
        clearInterval(times);
    }

}

if_btn();

//首页皮肤选择列表
$('.pifu-con').hover(function () {
    $('.iex-zuhti-list').fadeIn(250);
    $('.pifu-con .link-list-a .fa-angle-down').addClass('fa-rotate-180');
}, function () {
    $('.iex-zuhti-list').fadeOut(0);
    $('.pifu-con .link-list-a .fa-angle-down').removeClass('fa-rotate-180');
});

//微信二维码显示和隐藏
$('.fw-dingwei a').hover(function () {
    $('.fw-weixing').fadeIn(250);
}, function () {
    $('.fw-weixing').fadeOut(0);
});


$('.muban li').click(function () {
    _index = $(this).index();
    $(this).addClass('shaw').siblings().removeClass('shaw');
    $('.muban-list ul').eq(_index).fadeIn(250).siblings().fadeOut(0);
});
$('.ruanjian-tab li').click(function () {
    _index = $(this).index();
    $(this).addClass('shaw').siblings().removeClass('shaw');
    $('.ruanjian-list ul').eq(_index).fadeIn(250).siblings().fadeOut(0);
});

$('.list-link-4').hover(function () {
    //获取当前元素的title内容，赋值给_thisTit
    var _thisTit = $(this).attr('data-title');
    //tips提示内容为_thisTit（即等于当前鼠标滑过元素的title内容），吸附对象为当前鼠标滑过对象
    if (_thisTit != "") {	//判断条件，当前元素的data-title不等于空才执行下面的代码
        layer.tips(_thisTit, this, {
            tips: [1, '#1E9FFF'],
            time: 99999,
        });
    }

}, function () {
    $('.layui-layer-tips').css('display', 'none')
});

var btn = $("#kw-2"), oUl = $(".keylist")[0];

$("#qingkong").click(function () {
    oUl.style.display = 'none';
})

// 搜索联想
btn.keyup(function (e) {
    if (e.keyCode == 13 || e.keyCode == 40 || e.keyCode == 38) {
        e.preventDefault();
        return;
    }
    var value = this.value;
    if (value) {
        var oScript = document.createElement('script');
        oScript.src = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=' + value + '&cb=aa'
        document.body.appendChild(oScript);
        oScript.remove();
    } else if (value == 0) {
        oUl.style.display = 'none';
    }

})

// 控制搜索时显示联想内容的数量
function aa(data) {
    //console.log(data);
    oUl.style.display = 'block';
    var list = data.s;
    var str = '';

    for (var i = 0; i < list.length; i++) {
        // 最多显示8行
        if (i < 8) {
            str += '<li>' + list[i] + '</li>';
        }

    }
    oUl.innerHTML = str;
}

$(".keylist").on('click', 'li', function () {
    var value = $(this).text();
    btn.val(value);
    $('#su-2').click();
    oUl.style.display = 'none';
});

//利用键盘控制选择搜索联想词
$(document).keydown(function (e) {

    if (e.keyCode == 13 && oUl.style.display == 'block') {
        btn.val($(".keylist li.active").html().trim());
        $('#su-2').click();
        oUl.style.display = 'none';
        //alert('你按下了Enter');
    } else if (e && e.keyCode == 40 && oUl.style.display == 'block') { //下
        //active
        if ($(".keylist li.active").length > 0) {
            var k1 = $(".keylist li.active")
            k1.next().addClass("active");
            k1.removeClass("active");
        } else {
            var k0 = $($(".keylist li")[0]);
            k0.addClass("active");
        }
    } else if (e && e.keyCode == 38 && oUl.style.display == 'block') { // 上

        var k1 = $(".keylist li.active")
        k1.prev().addClass("active");
        k1.removeClass("active");
    } else {
        //btn.keyup();
    }

});





