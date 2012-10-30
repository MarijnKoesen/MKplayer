if (!window.MK)
    window.MK = {};

(function(MK) {
    MK.ajax = function(url, options) {
        var options = options || {};
        var defaultOptions = {
            async: true,
            method: 'POST',
            decodeJson: true,
            callback: null
        }

        MK.extend(options, defaultOptions, false);

        var xmlHttp = new XMLHttpRequest();
        if (options.callback) {
            xmlHttp.onreadystatechange = function() {
                if(xmlHttp.readyState == 4) {
                    if (options.decodeJson) {
                        try {
                            options['callback'](eval(xmlHttp.responseText));
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        options['callback'](xmlHttp);
                    }
                }
            }
        }

        xmlHttp.open(options['method'], url, (options['async']) ? true : false);
        xmlHttp.send(null);
    }

    MK.extend = function(dest, source, overwrite) {
        for (var attr in source)
            if (!dest.hasOwnProperty(attr) || overwrite)
                dest[attr] = source[attr];
    }

    /**
     * Make an element draggable
     *
     * @type {*}
     */
    MK.draggable = (function() {
        // Encapsulate most of the logic in a private namespace
        // See the button of the function for the api
        var hasRegisteredMouseMoveEvent = false;
        var draggingElement; // The element that is being dragged
        var draggingOptions; // The drag options for the current draggingElement
        var dragStartMousePos;
        var dragStartElementPos;
        var that = this;

        var registerMouseMoveEvent = function() {
            window.addEventListener('mousemove', function(event) {
                if (this.draggingElement) {
                    // First call the callback and return if the callback returns false
                    if (this.draggingOptions.drag) {
                        if (this.draggingOptions.drag(event, this.draggingElement) === false)
                            return;
                    }

                    // Move the element to position of the mouse
                    if (!this.dragStartMousePos) {
                        // The first (event) we drag the element we need to set the starting positions
                        this.dragStartMousePos = {x: event.clientX, y: event.clientY};
                        this.dragStartElementPos = {x: this.draggingElement.offsetLeft, y: this.draggingElement.offsetTop};
                    }

                    if (this.draggingOptions.dragX) {
                        var newX = this.dragStartElementPos.x + (parseInt(event.clientX) - this.dragStartMousePos.x);


                        if (this.draggingOptions.constrainToParent) {
                            if (newX < 0) {
                                newX = 0;
                            } else {
                                var maxX = (this.draggingElement.parentNode.offsetWidth || window.innerWidth) - this.draggingElement.offsetWidth;
                                if (newX > maxX)
                                    newX = maxX;
                            }
                        }

                        this.draggingElement.style.left = newX + "px";
                    }

                    if (this.draggingOptions.dragY) {
                        var newY = this.dragStartElementPos.y + (parseInt(event.clientY) - this.dragStartMousePos.y);

                        if (this.draggingOptions.constrainToParent) {
                            if (newY < 0) {
                                newY = 0;
                            } else {
                                var maxY = (this.draggingElement.parentNode.offsetHeight || window.innerHeight) - this.draggingElement.offsetHeight;

                                if (newY > maxY)
                                    newY = maxY;
                            }
                        }

                        this.draggingElement.style.top = newY + "px";
                    }

                    if (this.draggingOptions.drag) {
                        this.draggingOptions.drag(event, this.draggingElement);
                    }
                }
            }, false);

            hasRegisteredMouseMoveEvent = true;
        }

        window.addEventListener('mouseup', function() {
            this.draggingElement = null;
            this.dragStartMousePos = null;
            this.dragStartElementPos = null;
        }, false);

        function setDraggingElement(element, options, event) {
            var enableDragging = true;
            if (options.dragStart) {
                if (options.dragStart(event, element) === false) {
                    enableDragging = false;
                }
            } else if (options.strict && event.target != element) {
                enableDragging = false;
            }

            if (enableDragging) {
                this.draggingElement = element;
                this.draggingOptions = options;
            }
        }

        /**
         * @param element The element to make draggable
         * @param options The options
         */
        return function(element, options) {
            var options = options || {};
            var defaults = {
                constrainToParent: true, // don't let the element go beyond the bounds of the parent
                dragX: true, // allow draggin on x-axis
                dragY: true, // allow draggin on y-axis
                drag: null, // function to be executed during the dragging
                dragStart: null, // function to be executed when dragging is started, if the function returns false the dragging is cancelled
                strict: true // if true, the dragging will only occur if the element was directly clicked (so not it won't fire on a child element)
            };
            MK.extend(options, defaults);

            if (!hasRegisteredMouseMoveEvent)
                registerMouseMoveEvent();

            element.addEventListener('mousedown', setDraggingElement.bind(that, element, options));
        }
    })();

	MK.cookie = (function() {
		var parseCookieValue = function(value) {
			if (value.match(/^-?[0-9]+$/))
				return parseInt(value);
			else if (value.match(/^-?[0-9]+\.[0-9]+$/))
				return parseFloat(value);
			else if (value.match(/^(true|false)$/))
				return !!(value == 'true');
			else
				return value;
		}

		return {
			set: function(name, value, days) {
				if (days) {
					var date = new Date();
					date.setTime(date.getTime() + (days*24*60*60*1000));
					var expires = "; expires=" + date.toGMTString();
				} else {
					var expires = "";
				}

				document.cookie = name + "=" + value + expires + "; path=/";
			},

			get: function(name) {
				var nameEQ = name + "=";
				var ca = document.cookie.split(';');
				for(var i=0;i < ca.length;i++) {
					var c = ca[i];

					while (c.charAt(0) == ' ')
						c = c.substring(1,c.length);

					if (c.indexOf(nameEQ) == 0)
						return parseCookieValue(c.substring(nameEQ.length,c.length));
				}
				return null;
			},

			getAll: function() {
				var cookies = {}, parts, name;
				var ignoreList = ['ZDEDebuggerPresent'];

				var cookieStrings = document.cookie.split(';'), cookieString, i=0;
				while((cookieString = cookieStrings[i++])) {
					parts = cookieString.split('=');
					name = parts[0].trim();
					if (ignoreList.indexOf(name) == -1)
						cookies[name] = parseCookieValue(parts[1]);
				}

				return cookies;
			},

			delete: function(name) {
				MK.cookie.set(name, "", -1);
			}
		}
	})();


    /**
     * Get the absolute position for the element
     *
     * @param element
     * @return {Object}
     */
    MK.getAbsolutePosition = function(element) {
        var pos = {x: 0, y: 0};

        do {
            if (element.offsetLeft)
                pos.x = pos.x + parseInt(element.offsetLeft);

            if (element.offsetTop)
                pos.y = pos.y + parseInt(element.offsetTop);

            element = element.parentNode;
        } while (element);

        return pos;
    }

    /**
     * Convert a time notation to the number of seconds
     *
     * E.g.: timeToSeconds("2:02") => 122
     * E.g.: timeToSeconds("1:02:02") => 3722
     * E.g.: timeToSeconds("2:02") => 122
	 * E.g.: timeToSeconds("122") => 122
	 * E.g.: timeToSeconds("122.34") => 122.34
     *
     * @param time The time notation string
     * @return float The number of seconds or -1 if invalid time was passed
     */
    MK.timeToSeconds = function(time) {
		var match, seconds;

        if ((match = time.match(/^(([0-9])+:)?([0-9]+):([0-9]+)$/))) {
            seconds = (parseInt(match[3]) * 60) + parseInt(match[4]);

            if (match[2])
                seconds += parseInt(match[2]) * 60*60;

            return seconds;
		} else if (typeof(time) == 'number' || time.match(/^[0-9]+(\.[0-9]+)?$/)) { // allow microseconds
				return parseInt(time);
		} else {
            return -1;
        }
    }

    /**
     * Convert a number of seconds to a time notation
     *
     * E.g.: secondsToTime(122) => 2:02
     *
     * @param seconds numeric the number of seconds
     * @return {String}
     */
    MK.secondsToTime = function(theSeconds) {
		if (typeof(theSeconds) == 'number' || theSeconds.match(/^[0-9]+(\.[0-9]+)?$/)) {
			// Strip any milliseconds
			var remainingSeconds = Math.round(theSeconds);

			var hours, minutes, seconds = 0;

			if (remainingSeconds > 3600) {
				hours = Math.floor(remainingSeconds / 3600);
				remainingSeconds = remainingSeconds % 3600;
			}

			if (remainingSeconds > 60)
				minutes = Math.floor(remainingSeconds / 60);

			seconds = remainingSeconds % 60;

			var theTime = (hours > 0) ? hours + ":" : '';
			theTime += (minutes > 0) ? minutes+ ":" : '0:';
			theTime += (seconds < 10) ? "0" + seconds : seconds;

			return theTime;
		} else if (typeof(theSeconds) == 'string' && theSeconds.match(/^(([0-9])+:)?([0-9]+):([0-9]+)$/)) {
			return theSeconds;
		} else {
			return null;
		}


    }
})(window.MK);
