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
})(window.MK);
