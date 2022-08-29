/*
 * 探测 IP 端口是否开放
 * 2016-05-02
 * vc1
 *
 */
function PortScan() {
  // 超时时间，超时后标记端口不通，视网络质量可以适当调整
  this.portscan_timeout = 5000;
  // 扫描请求的并发数量
  // 255 in Chrome and 200 in Firefox
  // https://samsaffron.com/archive/2015/12/29/websockets-caution-required
  this.portscan_concurrence = 200;

  // 浏览器默认屏蔽的端口 Blocked Ports
  // http://www-archive.mozilla.org/projects/netlib/PortBanning.html#portlist
  this.blocked_ports = ["0", "1", "7", "9", "11", "13", "15", "17", "19", "20", "21", "22", "23", "25", "37", "42", "43", "53", "77", "79", "87", "95", "101", "102", "103", "104", "109", "110", "111", "113", "115", "117", "119", "123", "135", "139", "143", "179", "389", "465", "512", "513", "514", "515", "526", "530", "531", "532", "540", "556", "563", "587", "601", "636", "993", "995", "2049", "4045", "6000"];
  this.wsprotocol = 'ws' + (window.location.protocol === 'https:' ? 's' : '') + '://';
  // this.wsprotocol = 'wss://';

  // 探测完一个目标地址后触发 onscan(exitcode:端口状态，0代表能通, target:扫描目标)
  this.onscan = null;
  // 仅端口开放时触发 onopen(target:扫描目标)
  this.onopen = null;
  // 批量任务全部完成后触发 onfinish(result:)
  this.onfinish = null;

  this.queue = null;
  this.scanresult = [];
  this.opentarget = [];

  this.defaultPort = 80;
  this.mode = 'ws';
  this.detector = {
    'ws': 'wscan',
    'h5': 'h5scan'
  }
  this.scan_single = this.scan_single.bind(this);
  this.setMode();
}

// 设置回调事件
PortScan.prototype.setEvents = function(onfinish, onscan, isonopen_onopen, option) {
  /*
  解析多种输入格式
  function({onfinish/onscan/onopen})
  function(finish_fn, open_fn, true)
  function(finish_fn, scan_fn, open_fn)
  */

  var args = [].slice.call(arguments);
  // 删除末尾的空项
  for (var last;
    (last === undefined || last === '' || last instanceof Array && last.length === 0) && args.length || args.push(last) && false; last = args.pop()) {}

  if (args.length === 0) return;

  var onopen = undefined;
  var option = args.pop();
  if (typeof option === 'object') {
    onfinish = option.onfinish || onfinish;
    onscan = option.onscan || onscan;
    onopen = option.onopen || onopen;
  }

  if (typeof isonopen_onopen === 'function') {
    onopen = isonopen_onopen;
  } else if (isonopen_onopen) {
    onopen = onscan;
    onscan = null;
  }

  this.onfinish = onfinish || this.onfinish;
  this.onscan = onscan || this.onscan;
  this.onopen = onopen || this.onopen;
}

// 设置扫描模式
PortScan.prototype.setMode = function(mode) {
  this.mode = mode in Object.getOwnPropertyNames(this.detector) ? mode : this.mode;
  switch (this.mode) {
    case 'ws':
      this.portscan_concurrence = 200;
      break;
    case 'h5':
      this.portscan_concurrence = 6;
      break;
  }
}

// 设置端口状态
PortScan.prototype.portstate = function(exitflag, target, callback) {
  if (typeof exitflag === 'function') {
    exitflag = exitflag();
  }
  exitflag === 'ok' && (exitflag = 'open');

  if (exitflag === 'open') {
    this.opentarget.push(target);
    this.onopen && this.onopen.call(this, target);
  }
  this.scanresult.push({
    flag: exitflag,
    target
  });
  this.onscan && this.onscan(exitflag, target);
  callback && callback.call(this, exitflag, target);
}

// 超时退出
PortScan.prototype.timeoutexit = function(ontimeout) {
  // 标记异常退出
  var flag = 'scan_timeout';
  var stopTimer = later(function(exit, count, interval) {
    stopTimer(flag);
    ontimeout && ontimeout(flag);
  }, this.portscan_timeout);
  //
  return stopTimer;
}

// 扫描入口方法，支持多种参数格式
PortScan.prototype.scan = function() {
  if (arguments[0] instanceof Array) {
    return this.scan_batch.apply(this, arguments);
  } else if (typeof arguments[1] === 'number' && typeof arguments[2] === 'number') {
    return this.scan_range.apply(this, arguments);
  } else {
    return this.scan_single.apply(this, arguments);
  }
}

// 使用websocket探测端口
PortScan.prototype.wscan = function(target, callback) {
  var _this = this;
  var ws = new WebSocket(this.wsprotocol + target);
  ws.onerror = ws.onopen = function(e) {
    stopTimer();
    _this.portstate('open', target, callback);
  }
  var workerkiller = function(flag) {
    stopTimer(flag);
    ws.onerror = null;
    ws.close();
    // 如果是队列控制超时此处就不再执行next
    callback = flag === 'worker_timeout' ? null : callback;
    _this.portstate(flag, target, callback);
  }
  var stopTimer = this.timeoutexit(workerkiller);
  return workerkiller;
}

// 浏览器请求静态资源的并发数
// https://github.com/tvrcgo/paper/issues/4

// 扫描单个目标
PortScan.prototype.scan_single = function(target, callback) {
  // 未指定端口号就增加默认端口
  if (!target.includes(':')) {
    target = target + ':' + this.defaultPort;
  }
  var port = target.split(':')[1];
  // 跳过被浏览器屏蔽的端口/和255广播地址
  if (this.blocked_ports.includes(port) || target.split(':')[0].split('.').pop() === '255') {
    this.portstate('blocked', target, callback);
    return;
  }

  return this.detector[this.mode] && this[this.detector[this.mode]].apply(this, arguments);
}

// 扫描批量目标
PortScan.prototype.scan_batch = function(tasks, onfinish, onscan, isonopen_onopen) {
  this.setEvents(onfinish, onscan, isonopen_onopen);

  var _this = this;
  //worker(task, next)
  var q = this.queue = new Queue(this.scan_single, this.portscan_concurrence);
  q.tasks = tasks;
  // q.timeout = this.portscan_timeout + 100;
  q.onfinish = function() {
    _this.onfinish && _this.onfinish.call(_this, _this.opentarget);
  }
  q.start();

  return q;
}

// 生成列表再扫描
PortScan.prototype.scan_range = function(host, start, end, onfinish, onscan, isonopen_onopen) {
  var start = parseInt(start) < 0 || parseInt(start) > 65535 ? 0 : parseInt(start);
  var end = parseInt(end) > 65535 || parseInt(end) < start ? start : parseInt(end);
  // var port = parseInt(range[2]) || this.defaultPort;
  var tasks = [];

  for (var i = start; i <= end; i++) {
    tasks.push(host.replace('*', i));
  }

  return this.scan_batch(tasks, onfinish, onscan, isonopen_onopen);
}

/*

var ps = new PortScan();
ps.onscan = function(flag, task){
   alert(task + '扫描完成，状态为：' + flag)
}
ps.onopen = function(task){
   prompt('开放端口', task)
}

// 分别执行以下三个方法

// 探测单个目标
ps.scan('baidu.com');

// 批量探测
ps.scan(['baidu.com:22', 'baidu.com:443', 'baidu.com:1024'])

// 生成一段地址并探测
ps.scan('baidu.com:*', 75, 85)


*/
