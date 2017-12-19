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
        }
    }
});

