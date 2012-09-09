(function(MK) {
    MK.Song = function(attributes) {
        this.url = null;
        this.title = null;
        this.artist = null;
        this.album = null;
        this.length = null;

        if (typeof attributes == 'object') {
            MK.extend(this, attributes, true);
        } else {
            console.error("The attributes parameter to create a Song needs to be an object");
            return null;
        }

        if (!this.url) {
            console.error("A song always needs to have a url")
            return null;
        }
    }

    MK.extend(MK.Song.prototype, {
        isSong: function(obj) {
            return typeof(obj) == 'object' && obj.constructor.prototype == MK.Song.prototype;
        },

        getFullName: function() {
            var fullName = '';

            if (this.artist)
                fullName += this.artist + " - ";

            if (this.album)
                fullName += this.album + " - ";

            if (this.title)
                fullName += this.title;

            return fullName.replace(/ - $/, "");
        },

        getDuration: function() {
            return this.length;
        },

        getDurationInSeconds: function() {
            var match;
            if ((match = this.length.match(/([0-9]+):([0-9]+):([0-9]{2})/))) {
                return parseInt(match[1] * 3600) + parseInt(match[2] * 60) + parseInt(match[3]);
            } else if ((match = this.length.match(/([0-9]+):([0-9]{2})/))) {
                return parseInt(match[1] * 60) + parseInt(match[2]);
            } else {
                return this.length;
            }
        }
    });
})(MK);

