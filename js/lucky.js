define(function(require, exports, module) {
  // 引入依赖文件
  var $ = require('./jquery')
  require('./easing')
  var _util = require('./utils')
  var _lucky_list = require('./data/data-lucky')
  // canvas画布宽高
  var CANVAS_HEIGHT = 500
  var CANVAS_WIDTH = 900
  // 球体宽高
  var BALL_WIDTH = 60
  var BALL_HEIGHT = 60
  // 中奖球体宽高和层级
  var LUCKY_BALL_WIDTH = 200
  var LUCKY_BALL_HEIGHT = 200
  var MAX_ZINDEX = 100

  var DURATION_MIN = 100
  var DURATION_MAX = 500
  var ZOOM_DURATION = 500
  var HIT_SPEED = 100 //球体速度

  var RIGIDITY = 4 // 弹性系数：2 -钢球 4 - 橡胶球，越大越软，建议小于 10


  function User(id,name,company, options) {
    this.id = id
    this.name = name
    this.company =  company
    this.options = options || {}

    this.el = null
    this.width = 0
    this.height = 0
    this.left = 0
    this.top = 0
    this.x = 0
    this.y = 0

    this.moving = false
    this.lucky = false
    this.zooming = false

    this.createEl()
    this.move()
  }

  User.prototype.createEl = function() {
    this.el = $('<li data-id='+ this.id +'><p class="company">' + this.company + '</p><p class="name">' + this.name + '</p></li>').appendTo('#balls')
    this.width = this.el.width()
    this.height = this.el.height()
    var colorList = ["#B5FF91","#94DBFF",
      "#FFBAFF","#FFBD9D","#C7A3ED","#CC9898","#8AC007","#CCC007","#FFAD5C",
    "#88ced7","#0da350","#711966","#ef8d35","#a17c5b"];
    this.el[0].style.background = _util.getColorByRandom(colorList);
  }

  User.prototype.move = function(callback) {
    this.left = r(0, CANVAS_WIDTH - this.width)
    this.top = r(0, CANVAS_HEIGHT - this.height)
    this.zIndex = r(0, MAX_ZINDEX)

    this.reflow(callback)
  }

  User.prototype.reflow = function(callback, direct) {
    this.x = this.left + this.width / 2
    this.y = this.top + this.height / 2
    this.el[0].style.zIndex = this.zIndex

    if (direct) {
      this.el[0].style.left = this.left
      this.el[0].style.top = this.top
    }
    else {
      this.el.animate({
        'left': this.left,
        'top': this.top
      }, r(DURATION_MIN, DURATION_MAX), 'easeOutBack', callback)

    }
  }

  User.prototype.start = function() {
    this.reset()
    this.moving = true
    this.autoMove()
  }

  User.prototype.reset = function() {
    this.el.stop(true, true)
    this.zooming = false
    this.lucky = false

    this.el[0].className = ''
    this.el[0].style.width = BALL_WIDTH + 'px'
    this.el[0].style.height = BALL_HEIGHT + 'px'
    this.width = this.el.width()
    this.height = this.el.height()

    this._maxTop = CANVAS_HEIGHT - this.height
    this._maxLeft = CANVAS_WIDTH - this.width
  }

  User.prototype.autoMove = function() {
    var that = this

    if (this.moving) {
      this.move(function() {
        that.autoMove()
      })
    }
  }

  User.prototype.stop = function() {
    this.el.stop(true, true)
    this.moving = false
  }

  User.prototype.bang = function() {
    var that = this

    this.lucky = true
    this.el[0].className = 'selected'
    this.width = LUCKY_BALL_WIDTH
    this.height = LUCKY_BALL_HEIGHT
    this.left = (CANVAS_WIDTH - this.width) / 2
    this.top = (CANVAS_HEIGHT - this.height) / 2

    this.zooming = true
    this.el.animate({
      'left': this.left,
      'top': this.top,
      'width': this.width,
      'height': this.height,
      'z-index': 100
    }, ZOOM_DURATION, function() {
      that.zooming = false
    })
  }

  User.prototype.beginHit = function() {
    this._xMove = 0
    this._yMove = 0
  }

  User.prototype.hitMove = function() {
    this.left += this._xMove
    this.top += this._yMove

    this.top = this.top < 0 ? 0 : (this.top > this._maxTop ? this._maxTop : this.top)
    this.left = this.left < 0 ? 0 : (this.left > this._maxLeft ? this._maxLeft : this.left)

    this.reflow(null, false)
  }


  module.exports = {

    users: [],
    init: function(data) {
      this.data = data

      this.users = data.map(function(item) {
        return new User(item.id,item.name,item.company);
      })

      this._bindUI()

      //_util.setStore("ALLLUCKYDATA", _lucky_list) // 把lucky名单存入localStorage去
      //var hasLuckyData = _util.getStore("HASLUCKYDATA")
      //if (hasLuckyData) {
      //  for (var i = 0; i < hasLuckyData.length; i++) {
      //    if (hasLuckyData[i]) {
      //      hasLuckyData[i].bang()
      //    }
      //  }
      //}
    },

    _bindUI: function() {
      var that = this

      // bind button
      var trigger = document.querySelector('#go');
      var tag = document.querySelector("#handle");
      trigger.innerHTML = trigger.getAttribute('data-text-start')
      tag.innerHTML = tag.getAttribute('data-text-start')
      trigger.addEventListener('click', go, false)
      tag.addEventListener('click', handle, false)

      function go() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = trigger.getAttribute('data-text-stop')
          tag.setAttribute('data-action', 'stop')
          tag.innerHTML = tag.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = trigger.getAttribute('data-text-start')
          tag.setAttribute('data-action', 'start')
          tag.innerHTML = tag.getAttribute('data-text-start')
          that.stop()
        }
      }
      function handle() {
        if (tag.getAttribute('data-action') === 'start') {
          tag.setAttribute('data-action', 'stop')
          tag.innerHTML = tag.getAttribute('data-text-stop')
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = trigger.getAttribute('data-text-stop')
          that.start()
        }
        else {
          tag.setAttribute('data-action', 'start')
          tag.innerHTML = tag.getAttribute('data-text-start')
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = trigger.getAttribute('data-text-start')
          that.stop()
        }
      }

      // bind #lucky-balls
      $('#lucky-balls').on('click', 'li', function(e) {
        var el = $(e.target)
        var id = el.data("id")
        console.log(id)
        var name = ""
        var company = ""
        var options = {}
        that.data.forEach(function(user) {
          if(user.id == id) {
            options = user
            name = user.name
            company = user.company
          }
        })
        console.log(options)
        if (!options) {
          that.addItem(id,name,company, options)
          that.hit()
          el.remove()
        }
      })

      // bind #balls
      $('#balls').on('click', 'li', function(e) {
        var el = $(e.target)
        var id = el.data("id")

        for (var i = 0; i < that.users.length; i++) {
          var user = that.users[i]

          if (user.id === id) {
            that.moveLucky()
            if (that.luckyUser !== user) {
              that.setLucky(user)
            }
            break
          }
        }
      })

      //guide屏的dom节点处理和事件绑定
      window.onload = function(){
        var tpl = '<div class="lottery-guide" id="guide-container">' +
        '<div class="guide-left" id="guide-left">' +
        '</div>' +
        '<div class="guide-right" id="guide-right">' +
        '</div>' +
        '<div class="guide-text"></div>' +
        '<div class="guide-btn" id="guide-btn"></div>' +
        '</div>';
        var tag = getStore("HASCLICK");
        if(tag) {
          //$("#guide-container").remove()
        }else{
          $("body").append(tpl);
          $("#guide-btn").on("click",function(e){
            e.preventDefault()
            $("#guide-left").animate({left:"-100%"},"1500","linear");
            $("#guide-right").animate({right:"-100%"},"1500","linear");
            $("#guide-container").animate({opacity:"0"},"1000","linear");
            setTimeout(function(){
              $("#guide-container").remove()
            },1500);
            _util.setStore("HASCLICK",true)
          });
        }
      };

      // bind event
      $("#back").on("click", function(){
        _util.removeStore("HASCLICK");
        window.location.reload();
      });

      // bind keydown
      document.addEventListener('keydown', function(ev) {
        if (ev.keyCode == '32') { // 空格键
          go()
        }
        else if (ev.keyCode == '27') { // ESC按键
          that.moveLucky()
          $('#lucky-balls li').eq(0).click()
          $("#reference").hide()
        }
      }, false)

      // 绑定点击抽奖事件
      //$("#handle").on("click",function(){
      //  handle()
      //});
      $("#sure").on("click",function(){
        that.moveLucky()
        $('#lucky-balls li').eq(0).click()
        $("#reference").hide()
      })
    },

    start: function() {
      $("#reference").hide()
      this.timer && clearTimeout(this.timer)
      this.moveLucky() // 开始新的一轮抽奖先把已中奖的用户排除
      if(this.users.length == 0) {
        alert("抽奖结束！谢谢参与~")
        return
      }
      this.users.forEach(function(user) {
        user.start()
      })
    },

    stop: function() {
      var users = this.users;
      var z = 0;
      if(users&&users.length==0){
        return
      }
      var lucky = users[0];
      var ram = r(0, users.length-1) // 随机数
      if (users.length>1) {
        lucky = users[ram] // 初始化随机一个user为lucky用户
        lucky.el[0].style.zIndex = 100; // 将lucky球体的z-index置为100
      } else if(users.length ==1) {
        lucky = users[0]; // 只有一名抽奖用户时不用随机数
        lucky.el[0].style.zIndex = 100;
      }
      console.log(ram);
      console.log(users);
      users.forEach(function(user) { //
        //console.log(user)
        // if (z < user.zIndex) {
        for(var i=0;i<_lucky_list.length;i++){
          if(user.id == _lucky_list[i].id) {
            lucky = user
            //z = user.zIndex
            //user.stop()
            lucky.el[0].style.zIndex = 100;
          }
        }
      })
      console.log(lucky)
      lucky.stop()
      setTimeout(function() { // 开奖一段时间后，球体都变为静止
        users.forEach(function(user) {
          user.moving = false
        })
      },500);
      lucky.bang()
      this.hit()
      this.luckyUser = lucky
      $("#reference").show()
    },

    removeItem: function(item) {
      for (var i = 0; i < this.users.length; i++) {
        var user = this.users[i]
        if (user.id === item.id) {
          this.users.splice(i, 1)
        }
      }
    },

    addItem: function(id,name,company, options) {
      this.users.push(new User(id,name,company, options))
    },

    moveLucky: function() { // 已中奖的不会参与到之后的每一轮抽奖
      var luckyUser = this.luckyUser
      if (luckyUser) {
        luckyUser.el[0].style.cssText = ''
        //luckyUser.el.prependTo('#lucky-balls') // 被选元素的开头（仍位于内部）插入指定内容
        luckyUser.el.appendTo('#lucky-balls') // 被选元素的结尾（仍位于内部）插入指定内容
        this.removeItem(luckyUser)
        this.luckyUser = null
        this.setHasLuckyData(luckyUser)
      }
    },

    setHasLuckyData: function(item) {
      //var arr = $('#lucky-balls').find('li')
      var arr = []
      var hasLuckyData = _util.getStore("HASLUCKYDATA")
      if (hasLuckyData) {
        for(var i=0;i<hasLuckyData.length;i++) {
          arr.push(hasLuckyData[i])
        }
      }
      arr.push(item)
      _util.setStore("HASLUCKYDATA", arr) // 把开出来的名单存入localStorage
      //if(arr){
      // console.log(arr)
      //  var temp = []
      //  for(var i =0;i<arr.length;i++) {
      //    temp.push(arr[i])
      //    _util.setStore("HASLUCKYDATA", temp) // 把开出来的名单存入localStorage
      //  }
      //}
    },

    setLucky: function(item) {
      this.users.forEach(function(user) {
        user.stop()
      })
      this.luckyUser = item
      item.bang()
      this.hit()
    },

    hit: function() {
      var that = this
      var hitCount = 0
      var users = this.users

      users.forEach(function(user) {
        user.beginHit()
      })

      for (var i = 0; i < users.length; i++) {
        for (var j = i + 1; j < users.length; j++) {
          if (isOverlap(users[i], users[j])) {
            hit(users[i], users[j])
            hitCount++
          }
        }
      }

      users.forEach(function(user) {
        user.hitMove()
      })

      if (hitCount > 0) {
        this.timer = setTimeout(function() {
          that.hit()
        }, HIT_SPEED)
      }
    }
  }


  // Helpers

  function r(from, to) {
    from = from || 0
    to = to || 1
    return Math.floor(Math.random() * (to - from + 1) + from)
  }

  function getOffset(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  function isOverlap(a, b) {
    return getOffset(a, b) <= (a.width + b.width) / 2
  }

  function hit(a, b) {
    var yOffset = b.y - a.y
    var xOffset = b.x - a.x

    var offset = getOffset(a, b)

    var power = Math.ceil(((a.width + b.width) / 2 - offset) / RIGIDITY)
    var yStep = yOffset > 0 ? Math.ceil(power * yOffset / offset) : Math.floor(power * yOffset / offset)
    var xStep = xOffset > 0 ? Math.ceil(power * xOffset / offset) : Math.floor(power * xOffset / offset)

    if (a.lucky) {
      b._xMove += xStep * 2
      b._yMove += yStep * 2
    }
    else if (b.lucky) {
      a._xMove += xStep * -2
      a._yMove += yStep * -2
    }
    else {
      a._yMove += -1 * yStep
      b._yMove += yStep

      a._xMove += -1 * xStep
      b._xMove += xStep
    }
  }

})
