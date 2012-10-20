if (!window.MK)
	window.MK = {};

(function(MK) {
    MK.EventRegistry = function() {
        this.listeners = {};
    }

    MK.extend(MK.EventRegistry.prototype, {
        broadcast: function(eventName, parameter) {
            var i = 0, listener;

            if (eventName in this.listeners)
                while ((listener = this.listeners[eventName][i++]))
                    listener(parameter);
        },

        addListener: function(eventName, callback) {
            if (this.listeners[eventName])
                this.listeners[eventName].push(callback);
            else
                this.listeners[eventName] = [callback];
        },

        removeAllListeners: function(eventName) {
            if (eventName in this.listeners)
                this.listeners[eventName] = [];
        },

        removeListener: function(eventName, callback) {
            if (eventName in this.listeners)
                if (this.listeners[eventName].indexOf(callback) != -1)
                    this.listeners[eventName].splice(this.listeners[eventName].indexOf(callback), 1);
        }
    });
})(MK);

