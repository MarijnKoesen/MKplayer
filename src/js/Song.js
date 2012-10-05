(function(MK) {
    MK.Song = function(attributes) {
		// The defaults, these will be overwritten by attributes
        this.url = null;
        this.title = null;
        this.artist = null;
        this.album = null;
        this.length = null; // numeric e.g. 122

		// Overwrite the object vars with the attributes
        if (typeof attributes == 'object') {
            MK.extend(this, attributes, true);
        } else {
            console.error("The attributes parameter to create a Song needs to be an object");
            return null;
        }

		// Make sure we are sane
        if (!this.url) {
            console.error("A song always needs to have a url")
            return null;
        }

        this.length = MK.timeToSeconds(this.length);
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

        getLength: function() {
            return this.length;
        }
    });
})(MK);

