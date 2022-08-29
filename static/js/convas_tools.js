/*
 * License:  The MIT License (MIT) Ryasnoy Paul、todaylg
 * https://github.com/philippica/philippica.github.io
 */

MagicWand = (function () {
    var lib = {}

    /*
     * 功能: 管理的元素对象的ID
     */
    var canvas_id = undefined

    /*
     * 功能: 管理的元素对象
     */
    var canvas = undefined
    var context = undefined

    /*
     * 功能: 绘图模式、floodFill抠图模式
     * eraser: 橡皮擦模式  paint: 绘图模式   cutout: 抠图模式
     */
    var mode = 'paint'
    var isMousePressed = false //鼠标是否被按下

    /*
     * 功能: 绘图模式点结构定义
     */
    var ppPoint = function (x, y) {
        this.x = x
        this.y = y
    }
    // 绘图上一个点位置
    var ppLastPoint = new ppPoint(0, 0)

    /*
     * 功能: RGBA 颜色定义
     */
    var Color = function (r, g, b, a) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    // 默认填充颜色白色透明
    var fillColor = new Color(255, 255, 255, 0)

    /*
     * 功能: border 宽度
     */
    var ppBoderLeft = 0
    var ppBoderTop = 0

    /*
     * 功能: 暂存操作记录，undo和redo
     * this.recordFN({  ImgBase64: imgData })
     */
    var record = undefined

    /*
     * 功能: 色差阈值，主要用于消色时颜色对比，0-255
     */
    var threshold = 3

    //橡皮擦形状 ,circle 或 square
    var __eraserShape = 'circle',
        //橡皮擦大小
        _eraserSize = 5,
        ERASER_LINE_WIDTH = 1,
        ERASER_SHADOW_STYLE = 'blue',
        ERASER_STROKE_STYLE = 'rgb(0,0,255)',
        ERASER_SHADOW_OFFSET = -5,
        EARSER_SHADOW_BLUR = 20

    /*
     * 功能:  初始化
     */
    lib.init = function ({id, recordFN, eraserShape, eraserSize}) {
        canvas_id = id
        record = recordFN
        _eraserShape = eraserShape
        _eraserSize = eraserSize
    }

    /*
     * 功能: 内部使用的初始化
     */
    function _init() {
        if (canvas) return
        canvas = document.getElementById(canvas_id)
        context = canvas.getContext('2d')
        context.lineWidth = 5 //设置线条宽度
        context.strokeStyle = 'red' //设置线条颜色
        eventProxy(canvas)

        // console.log('_init', canvas_id, canvas, context)
        // ppBoderLeft = parseInt(canvas.getAttribute('border-left-width'))
        // ppBoderTop = parseInt(canvas.getAttribute('border-top-width'))
    }

    /*
     * 功能:  设置橡皮擦形状
     */
    lib.setEraserShape = function (value) {
        _eraserShape = value
    }

    /*
     * 功能:  设置橡皮擦大小
     */
    lib.setEraserSize = function (value) {
        _eraserSize = value
    }

    /*
     * 功能:  设置消色阈值
     */
    lib.setThreshold = function (value) {
        threshold = value
    }


    /*
     * 功能:  选区模式
     */
    lib.setModeSelect = function (callback) {
        _init()
        ppMode = "select"
        ppDoPaint(callback)
    }

    /*
     * 功能:  切换为绘画模式
     */
    lib.setModePaint = function () {
        _init()
        ppMode = 'paint'
        ppDoPaint()
    }

    /*
     * 功能:  切换橡皮擦模式
     */
    lib.setModeEraser = function () {
        _init()
        ppMode = 'eraser'
        ppDoPaint()
    }

    /*
     * 功能:  切换抠图模式
     */
    lib.setModeCutout = function () {
        _init()
        ppMode = 'cutout'
        floodFill()
    }

    /*
     * 功能:  设置填充的颜色
     */
    lib.setFillColor = function (color = '#000000', alpha = 255) {
        let ppR = parseInt(color.substr(1, 2), 16)
        let ppG = parseInt(color.substr(3, 2), 16)
        let ppB = parseInt(color.substr(5, 2), 16)
        fillColor = new Color(ppR, ppG, ppB, alpha)
    }

    /*
     * 功能:  颜色取反
     */
    lib.invert = function () {
        // console.log('invert', element)
        _init()

        var imgData = context.getImageData(0, 0, canvas.width, canvas.height)
        for (var i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 0xff - imgData.data[i]
            imgData.data[i + 1] = 0xff - imgData.data[i + 1]
            imgData.data[i + 2] = 0xff - imgData.data[i + 2]
        }
        context.putImageData(imgData, 0, 0)
        record({ImgBase64: canvas.toDataURL()})
    }

    /*
     * 功能: floodFill抠图
     */
    function floodFill() {
        if (ppMode !== 'cutout') return
        canvas.unbind()
        var dx = new Array(0, 0, -1, 1, -1, -1, 1, 1)
        var dy = new Array(1, -1, 0, 0, -1, 1, -1, 1)
        var ppCanvasWidth = canvas.width
        var ppCanvasHeight = canvas.height

        canvas.addEventListener('mousedown', e => {
            var ppImgData = context.getImageData(0, 0, canvas.width, canvas.height)
            // var mouseX = e.pageX - this.offsetLeft - ppBoderLeft
            // var mouseY = e.pageY - this.offsetTop - ppBoderTop
            var mouseX = e.offsetX
            var mouseY = e.offsetY
            var R = ppImgData.data[(mouseY * ppCanvasWidth + mouseX) * 4]
            var G = ppImgData.data[(mouseY * ppCanvasWidth + mouseX) * 4 + 1]
            var B = ppImgData.data[(mouseY * ppCanvasWidth + mouseX) * 4 + 2]
            var ppQueue = new Array()
            var ppVisit = new Array()
            var ppField = dx.length
            ppQueue.push(new ppPoint(mouseX, mouseY))
            while (ppQueue.length != 0) {
                var u = ppQueue.shift()
                for (var i = 0; i < ppField; i++) {
                    var X = u.x + dx[i]
                    var Y = u.y + dy[i]
                    if (X < 0 || Y < 0 || X > ppCanvasWidth || Y > ppCanvasHeight || ppVisit[Y * ppCanvasWidth + X]) continue
                    ppVisit[Y * ppCanvasWidth + X] = true
                    if (Math.abs(ppImgData.data[(Y * ppCanvasWidth + X) * 4] - R) > threshold) continue
                    if (Math.abs(ppImgData.data[(Y * ppCanvasWidth + X) * 4 + 1] - G) > threshold) continue
                    if (Math.abs(ppImgData.data[(Y * ppCanvasWidth + X) * 4 + 2] - B) > threshold) continue
                    ppImgData.data[(Y * ppCanvasWidth + X) * 4] = fillColor.r
                    ppImgData.data[(Y * ppCanvasWidth + X) * 4 + 1] = fillColor.g
                    ppImgData.data[(Y * ppCanvasWidth + X) * 4 + 2] = fillColor.b
                    ppImgData.data[(Y * ppCanvasWidth + X) * 4 + 3] = 255
                    ppQueue.push(new ppPoint(X, Y))
                }
            }
            context.putImageData(ppImgData, 0, 0)
            record({ImgBase64: canvas.toDataURL()})
        })
    }

    /*
     * 功能:  事件监听器代理
     * Usage:
     *   添加元素代理
     *   Element = document.getElementById('ElementID')
     *   eventProxy(Element)
     *
     *   添加监听事件和删除所有监听事件
     *   Element.addEventListener('mousemove', e => {})
     *   Element.unbind()
     */
    function eventProxy(ele) {
        const addEventListener = ele.addEventListener
        ele.addEventListener = function (type, listener) {
            this.__listeners = this.__listeners || []
            this.__listeners.push({type: type, listener: listener})
            addEventListener.call(this, type, listener)
        }
        ele.unbind = function () {
            while (this.__listeners && this.__listeners.length != 0) {
                var {type, listener} = this.__listeners.shift()
                // console.log('eventProxy', type)
                this.removeEventListener(type, listener)
            }
        }
    }

    function ppDrawLine(curX, curY) {
        // console.log('ppDrawLine', curX, curY, ppLastPoint)
        context.beginPath() //开始绘制线条，若不使用beginPath，则不能绘制多条线条
        context.moveTo(ppLastPoint.x, ppLastPoint.y) //线条开始位置
        context.lineTo(curX, curY) //线条经过点
        context.closePath() //结束绘制线条，不是必须的
        context.stroke() //用于绘制线条
    }

    /*
     * 功能:  绘画模式和橡皮擦模式，添加事件监听
     * 1、 鼠标移动的时候划线
     * 2、 鼠标按键离开的时候，停止
     */
    function ppDoPaint(callback) {

        // if (ppMode !== 'paint') return
        canvas.unbind()
        canvas.addEventListener('mousemove', e => {
            if (isMousePressed) {
                console.log("mousemove")
                // var mouseX = e.pageX - e.offsetX - ppBoderLeft
                // var mouseY = e.pageY - e.offsetY - ppBoderTop
                var mouseX = e.offsetX
                var mouseY = e.offsetY
                if (ppMode === 'paint') {
                    ppDrawLine(mouseX, mouseY)
                } else if (ppMode === 'select') {
                    callback(ppLastPoint.x, ppLastPoint.y, mouseX - ppLastPoint.x, mouseY - ppLastPoint.y)
                    // console.log("mousemove", ppLastPoint.x, ppLastPoint.y, mouseX - ppLastPoint.x, mouseY - ppLastPoint.y)
                    context.save(); //保存坐原点平移之前的状态
                    context.fillStyle = 'red'       // 在原有配置基础上对颜色做改变
                    context.strokeRect(ppLastPoint.x, ppLastPoint.y, mouseX - ppLastPoint.x, mouseY - ppLastPoint.y)
                    context.restore(); //恢复到最初状态
                }
                else {
                    eraseLast()
                    drawEraser(mouseX, mouseY)
                }
                if (ppMode === 'select') {

                }
                else {
                    ppLastPoint = new ppPoint(mouseX, mouseY)
                }

            }
        })
        canvas.addEventListener('mousedown', e => {
            if (e.which == 1) {
                isMousePressed = true
                var mouseX = e.offsetX
                var mouseY = e.offsetY
                ppLastPoint = new ppPoint(mouseX, mouseY)
            }
        })
        canvas.addEventListener('mouseup', e => {
            isMousePressed = false
            if (ppMode === 'eraser') {
                eraseLast()
            }
            record({ImgBase64: canvas.toDataURL()})
        })
        canvas.addEventListener('mouseleave', e => {
            isMousePressed = false
            if (ppMode === 'eraser') {
                eraseLast()
            }
            record({ImgBase64: canvas.toDataURL()})
        })
    }

    //  擦除最后一个坐标点
    function eraseLast() {
        if (_eraserShape === 'square') {
            context.clearRect(ppLastPoint.x - _eraserSize / 2, ppLastPoint.y - _eraserSize / 2, _eraserSize, _eraserSize)
            return
        }
        //circle
        context.save()
        context.beginPath()
        context.arc(ppLastPoint.x, ppLastPoint.y, _eraserSize / 2, 0, 2 * Math.PI)
        context.clip()
        context.clearRect(ppLastPoint.x - _eraserSize / 2, ppLastPoint.y - _eraserSize / 2, _eraserSize, _eraserSize)
        context.restore()
    }

    // 画橡皮擦
    function drawEraser(mouseX, mouseY) {
        context.save()
        setEraseAttributes()
        context.beginPath()

        // 橡皮擦小于【实际擦除】大小，不然会留痕
        let size = _eraserSize - 4 > 0 ? _eraserSize - 2 : _eraserSize
        if (_eraserShape === 'circle') {
            context.arc(mouseX, mouseY, size / 2, 0, Math.PI * 2, false)
        } else {
            context.rect(mouseX - size / 2, mouseY - size / 2, size, size)
        }
        context.clip()
        context.stroke()
        context.restore()
    }

    /**
     * 设置橡皮擦的属性
     */
    function setEraseAttributes() {
        context.lineWidth = ERASER_LINE_WIDTH
        context.shadowColor = ERASER_SHADOW_STYLE
        context.shadowOffsetX = ERASER_SHADOW_OFFSET
        context.shadowOffsetY = ERASER_SHADOW_OFFSET
        context.shadowBlur = EARSER_SHADOW_BLUR
        context.strokeStyle = ERASER_STROKE_STYLE
    }

    function reverse(x) {
        var ret = ''
        var len = x.length
        for (var i = len - 1; i >= 0; i--) {
            ret += x[i]
        }
        return ret
    }

    function Hex(x) {
        var num = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F')
        var ret = ''
        while (x) {
            ret += num[x % 16]
            x = parseInt(x / 16)
        }
        if (ret.length == 0) ret += '00'
        if (ret.length == 1) ret += '0'
        return reverse(ret)
    }

    function rgb(r, g, b) {
        return '#' + Hex(r).concat(Hex(g).concat(Hex(b)))
    }

    return lib
})()
