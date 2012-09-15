if (!window.MK)
    window.MK = {};

(function(MK) {
    MK.ajax = function(url, options) {
        var defaultOptions = {
            async: true,
            method: 'POST',
            callback: null
        }

        MK.extend(options || {}, defaultOptions, false);

        var xmlHttp = new XMLHttpRequest();
        if (options.callback) {
            xmlHttp.onreadystatechange = function() {
                if(xmlHttp.readyState == 4) {
                    options['callback'](xmlHttp);
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
     * Pass any time format and the seconds will be returned
     *
     * E.g. parseLengthToSeconds(122) => 122
     * E.g. parseLengthToSeconds('2:02') => 122
     *
     * @param string|number The length
     * @return number The number of seconds
     */
    MK.parseLengthToSeconds = function(length) {
        if (!length || length == '')
            return 0;
        else if (typeof(length) == 'number' || length.match(/^[0-9]+(\.[0-9]+)?$/))
           return length;
        else
            return this.timeToSeconds(length);
    }

    /**
     * Convert a time notation to the number of seconds
     *
     * E.g.: timeToSeconds("2:02") => 122
     * E.g.: timeToSeconds("1:02:02") => 3722
     * E.g.: timeToSeconds("2:02") => 122
     *
     * @param time The time notation string
     * @return numeric The number of seconds or -1 if invalid time was passed
     */
    MK.timeToSeconds = function(time) {
        var match = time.match(/^(([0-9])+:)?([0-9]+):([0-9]+)$/);

        if (match) {
            var seconds = (parseInt(match[3]) * 60) + parseInt(match[4]);

            if (match[2])
                seconds += parseInt(match[2]) * 60*60;

            return seconds;
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
    }
})(window.MK);
