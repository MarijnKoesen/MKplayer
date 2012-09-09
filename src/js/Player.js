(function(MK) {
    MK.Player = function(options) {
        this.playlist = [];
        this.playQueue = []; // Queue with songs to play first

        // The current playing song object
        this.currentSong = null;

        this.playing = false;
        this.repeat = true;
        this.shuffle = false;

        this.volume = 1; // min: 0, max: 1

        this.eventRegistry = new MK.EventRegistry();

        this.EVENTS = [
            'play', // fired when a the player starts to play a new song
            'playing', // fired every second while the player is playing
            'stop', // fired when the player stops playing the current song
            'pause',
            'songAdded',
            'playlistLoaded',
            'volumeChanged'
        ];

        this._init();
    }

    MK.extend(MK.Player.prototype, {
        /**
         * Add a song to the playlist
         *
         * @param song MK.Song the song to add
         * @return int The number of the song in the playlist
         */
        addSong: function(song) {
            if (MK.Song.prototype.isSong(song)) {
                this.playlist.push(song);
                this.eventRegistry.broadcast('songAdded', song);
                return this.playlist.length-1;
            } else {
                return false;
            }
        },

        /**
         * Play the song at playlist position playlistIndexO
         *
         * @param playlistIndex int The playlist position to play
         */
        play: function(playlistIndex) {
            if (this.playlist[playlistIndex]) {
                // Play the requested song
                if (this.currentSong != this.playlist[playlistIndex])
                    this.audioEngine.src = this.playlist[playlistIndex].url;

                this.currentSong = this.playlist[playlistIndex];
                this.playing = true;
                this.audioEngine.play();

                this.eventRegistry.broadcast("play", this.currentSong);
            } else {
                // If we add a click event to a button and let the click event call this function we'll get an event passed
                // as playlistIndex, so treat that as having passed nothing at all and play the current song from the beginning
                this.stop();
                this.play(this.getCurrentSongIndex());
            }
        },

        /**
         * Stop playback of the current song
         */
        stop: function() {
            if (this.playing) {
                this.audioEngine.pause();
                if (this.audioEngine.currentTime)
                    this.audioEngine.currentTime = 0;

                this.eventRegistry.broadcast("stop", this.currentSong);
            }

            this.playing = false;
        },

        /**
         * Pause the current playing song
         */
        pause: function() {
            this.audioEngine.pause();
            this.playing = false;
        },

        /**
         * Play the next song
         *
         * The next song is seleced by a few criterea:
         *  - First any queued songs are played, if no songs are queued:
         *  - Play a random song if we're on shuffle, else:
         *  - Play the next song if we're not on shuffle
         *  - If we've reached the last song of the playlist start over if we're on repeat
         */
        next: function() {
            if (!this.playlist.length)
                return false;

            if (this.playQueue.length) {
                // The queued songs have priority over everything else
                // But make sure the songs still exists and has not been deleted from the playlist in the meantime
                var song = this.playQueue.shift(), songIndex;
                if ((songIndex = this.playlist.indexOf(song)) >= 0)
                    this.play(songIndex);
                else
                    this.next();
            } else if (this.shuffle) {
                // Play a random song
                this.play(Math.round(Math.random() * this.playlist.length));
            } else {
                // Just play the next song, if we got any, if there's not a next song start over at the first song, if we're on repeat
                var nextSongIndex = this.getCurrentSongIndex() + 1;
                var nextSong = this.playlist[nextSongIndex];
                if (nextSong) {
                    this.play(nextSongIndex);
                } else if (this.repeat) {
                    this.play(0);
                }
            }
        },

        previous: function() {
            if (this.playQueue.length) {
                // The queued songs have priority over everything else
                // But make sure the songs still exists and has not been deleted from the playlist in the meantime
                var song = this.playQueue.shift(), songIndex;
                if ((songIndex = this.playlist.indexOf(song)) >= 0)
                    this.play(songIndex);
                else
                    this.previous();
            } else if (this.shuffle) {
                // Play a random song
                this.play(Math.round(Math.random() * this.playlist.length));
            } else {
                // Just play the next song, if we got any, if there's not a next song start over at the first song, if we're on repeat
                var previousSongIndex = this.getCurrentSongIndex() - 1;
                var previousSong = this.playlist[previousSongIndex];
                if (previousSong) {
                    this.play(previousSongIndex);
                } else if (this.repeat) {
                    this.play(this.playlist.length-1);
                }
            }
        },

        setVolume: function(value) {
            value = parseFloat(value);

            if (value === NaN)
                value = 1;

            if (value < 0)
                value = 0;
            else if (value > 1)
                value = 1;

            this.volume = value;
            this.audioEngine.volume = this.volume;

            this.eventRegistry.broadcast('volumeChanged', this.volume);
        },

        seek: function(time) {
            this.audioEngine.currentTime = time;
        },

        /**
         * Get the index of the current song, this will be 0 if no song has ever been played
         */
        getCurrentSongIndex: function() {
            var currentSongIndex = this.playlist.indexOf(this.currentSong);

            if (currentSongIndex >= 0)
                return currentSongIndex;
            else
                return 0;
        },

        /**
         * Load the playlist from the passed url and append all songs to the current playlist
         *
         * @param url The url of the playlist
         */
        appendPlaylist: function(url) {
            MK.ajax(url, { callback: this._doAppendPlaylist.bind(this)});
        },

        /**
         * Load the playlist, clearing the playlist first
         *
         * @param url The url of the playlist
         */
        loadPlaylist: function(url) {
            this.playlist = [];
            this.appendPlaylist(url);
        },

        /**
         * Add an eventlistener to the player
         *
         * @param event The event name to listen to, see MK.Player.EVENTS for all possible events
         * @param listener The callback function to call when the event occurs
         */
        addEventListener: function(event, listener) {
            if (this.EVENTS.indexOf(event) > -1)
                this.eventRegistry.addListener(event, listener);
            else
                console.log ("Can't add an event listener to the unknown event: " + event);
        },

        /**
         * Private: initialization function
         */
        _init: function() {
            this.audioEngine = document.createElement('audio');
            this.audioEngine.volume = this.volume;

            this.audioEngine.addEventListener('ended', this._onSongEnded.bind(this));

            this._broadcastPlayingEvent();
        },

        /**
         * Private: Broadcast our current playing position every 250 msec
         */
        _broadcastPlayingEvent: function() {
            if (this.playing) {
                this.eventRegistry.broadcast('playing', {song: this.currentSong, currentTime: this.audioEngine.currentTime});
            }

            setTimeout(this._broadcastPlayingEvent.bind(this), 250);
        },

        /**
         * Private: Parse the XmlHttpRequest and load all the songs
         *
         * @param xhrResult
         */
        _doAppendPlaylist: function (xhrResult) {
            var songs = eval(xhrResult.responseText);

            var i = 0, song;
            while ((song = songs[i++])) {
                this.addSong(new MK.Song(song));
            }

            this.eventRegistry.broadcast('playlistLoaded');
        },

        /**
         * Private handler that is called when a playing song has ended
         */
        _onSongEnded: function() {
            this.playing = false;
            this.next();
        }
    });
})(MK);

