/**
 * Created by dell on 2017/12/19.
 */

define(function(require, exports, module){
    module.exports = {
        /*
         * 设置localStorage
         */
        setStore:function(name, content)  {
            if (!name) return
            if (typeof content !== 'string') {
                content = JSON.stringify(content)
            }
            try {
                window.localStorage.setItem(name, content)
            } catch (e) {
                window.localStorage.setItem(name, content)
            }
        },

        /**
         * 获取 localStorage
         */
        getStore: function(name) {
            if (!name) return;
            var value;
            try {
                value = JSON.parse(window.localStorage.getItem(name))
            } catch (e) {
                value = window.localStorage.getItem(name)
            }
            return value
        },

        /**
         * 删除 localStorage
         */
        removeStore: function(name) {
            if (!name) return
            window.localStorage.removeItem(name);
        },
        /*
         * 8进制加密
         */
        EnEight: function (str){
            var monyer = new Array();
            var i,s;
            for(i=0;i<str.length;i++) {
                monyer+="\\"+str.charCodeAt(i).toString(8);
            }
            str = monyer;
            return str
        },
        /*
         * 8进制解密
          */
        DeEight: function(str){
            var monyer = new Array();
            var i;
            var s=str.split("\\");
            for(i=1;i<s.length;i++){
                monyer+=String.fromCharCode(parseInt(s[i],8));
            }
            str=monyer;
            return str;
        },
        /**
         * 获取随机色
         */
        getColorByRandom: function(colorList) {
            var colorIndex = Math.floor(Math.random()*colorList.length);
            var color = colorList[colorIndex];
            colorList.splice(colorIndex,1);
            return color;
        }
    }
});

