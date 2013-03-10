(function(MK) {
    MK.Player = function(options) {
        this.EVENTS = [
            'play', // fired when a the player starts to play a new song
            'playing', // fired every second while the player is playing
            'stop', // fired when the player stops playing the current song
            'pause', // fired when the player is paused
            'songAdded',
            'playlistLoaded',
            'volumeChanged',
            'songChanged',
            'repeatStateChanged'
        ];

        this.PLAYING_STATES = {
            STOPPED: 'STOPPED',
            PLAYING: 'PLAYING',
            PAUSED: 'PAUSED'
        };

        this.REPEAT_STATES = {
            REPEAT_NONE: 'REPEAT_NONE',
            REPEAT_ONE: 'REPEAT_ONE',
            REPEAT_ALL: 'REPEAT_ALL'
        };

        this.playlist = []; // The playlist
        this.playlistLoadQueue = []; // Queue with songs to add to the player
        this.playQueue = []; // Queue with songs to play first

        // The current playing song object
        this.currentSong = null;
        this.currentSongStartOffset = 0; // the number of (milli)seconds we started playing on

        this.playingState = this.PLAYING_STATES.STOPPED;
        this.repeatState = MK.Settings.get('repeat') || this.REPEAT_STATES.REPEAT_ALL;
        this.shuffle = MK.Settings.get('shuffle') !== null ? MK.Settings.get('shuffle') : false;
        this.volume = MK.Settings.get('volume') !== null ? MK.Settings.get('volume') : 1; // min: 0, max: 1

        this.eventRegistry = new MK.EventRegistry();

        this._init();
    }

    MK.extend(MK.Player.prototype, {
        /**
         * Add an array of songs to the player
         *
         * @param songs array of songs
         */
        addSongs: function(songs) {
            var song, i = 0;
            while ((song = songs[i++])) {
                this.addSong(song);
            }
        },

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
        play: function(playlistIndex, startOffset) {
            if (!this.playlist.length)
                return false;

            if (playlistIndex === undefined)
                playlistIndex = this.getCurrentSongIndex();

            // First check if we got a valid song index passed
            var newSong = this.playlist[playlistIndex];
            if (newSong) {
                // Song found, play the requested song
                if (this.playingState == this.PLAYING_STATES.PAUSED) {
                    // If we were paused we don't want the song to start from the beginning
                } else {
                    this.currentSongStartOffset = startOffset || 0;

                    this.audioEngine.src = newSong.url + (this.currentSongStartOffset ? '&start=' + startOffset : '');
                    this.eventRegistry.broadcast('songChanged', newSong);
                }

                this.currentSong = newSong;
                this.playingState = this.PLAYING_STATES.PLAYING;
                this.audioEngine.play();

                this.eventRegistry.broadcast("play", this.currentSong);
            }
        },

        /**
         * Stop playback of the current song
         */
        stop: function() {
            if (this.playingState == this.PLAYING_STATES.PLAYING) {
                this.audioEngine.pause();

                if (this.audioEngine.currentTime)
                    this.audioEngine.currentTime = 0;
            }

            this.playingState = this.PLAYING_STATES.STOPPED;

            this.eventRegistry.broadcast('stop', this.currentSong);
        },

        /**
         * Pause the current playing song
         */
        pause: function() {
            this.audioEngine.pause();
            this.playingState = this.PLAYING_STATES.PAUSED;

            this.eventRegistry.broadcast("pause");
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

            if (this.repeatState == this.REPEAT_STATES.REPEAT_ONE) {
                this.play(this.getCurrentSongIndex());
            } else if (this.playQueue.length) {
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
                if (this.playlist[nextSongIndex]) {
                    this.play(nextSongIndex);
                } else if (this.repeatState == this.REPEAT_STATES.REPEAT_ALL) {
                    this.play(0);
                }
            }
        },

        previous: function() {
            if (!this.playlist.length)
                return false;

            if (this.repeatState == this.REPEAT_STATES.REPEAT_ONE) {
                this.play(this.getCurrentSongIndex());
            } else if (this.playQueue.length) {
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
                if (this.playlist[previousSongIndex]) {
                    this.play(previousSongIndex);
                } else if (this.repeatState == this.REPEAT_STATES.REPEAT_ALL) {
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
            if (true) {
                this.play(this.getCurrentSongIndex(), time);
            } else {
                if (time >= 0)
                    this.audioEngine.currentTime = time;
                else
                    this.audioEngine.currentTime = 0;
            }
        },

        seekRelative: function(time) {
            // left
            time = time || 5;

            var pos = this.currentSongStartOffset + this.audioEngine.currentTime + time;
            if (pos < 0)
                pos = 0;

            this.seek(pos);
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

        setRepeatState: function(repeatState) {
            if (repeatState in this.REPEAT_STATES) {
                this.repeatState = repeatState;
                this.eventRegistry.broadcast('repeatStateChanged', this.repeatState);
            }
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
            this._bindKeyEvents();
        },

        /**
         * Private: Broadcast our current playing position every 250 msec
         */
        _broadcastPlayingEvent: function() {
            if (this.playingState == this.PLAYING_STATES.PLAYING) {
                this.eventRegistry.broadcast('playing', {song: this.currentSong, currentTime: this.audioEngine.currentTime + this.currentSongStartOffset});
            }

            setTimeout(this._broadcastPlayingEvent.bind(this), 250);
        },

        /**
         * Private: Parse the XmlHttpRequest and load all the songs
         *
         * @param array of song objects
         */
        _doAppendPlaylist: function (songs) {
            // When loading a playlist of say 100k items it would take some time, in the meantime the browser would 'hang'
            // if we were to load a playlist in one go.
            // To fix this we add everything to a queue and then add managable groups, this avoids a hanging browser.
            var i = 0, song;
            while ((song = songs[i++])) {
                this.playlistLoadQueue.push(song);
            }

            this._loadSongsFromQueue();
        },

        /**
         * Load a number of songs from the queue to prevent the browser from hanging
         *
         * @private
         */
        _loadSongsFromQueue: function() {
            if (this.playlistLoadQueue.length) {
                var doNow = this.playlistLoadQueue.splice(0, 10000)
                var songs = [], i = 0, song;

                while((song = doNow[i++])) {
                    if (MK.timeToSeconds(song.length) > 0)
                        songs.push(new MK.Song(song));
                }

                this.addSongs(songs);
            }

            // Keep loading until we've added the whole queue
            if (this.playlistLoadQueue.length) {
                setTimeout(this._loadSongsFromQueue.bind(this), 100);
            } else {
                this.eventRegistry.broadcast('playlistLoaded');
            }
        },

        _bindKeyEvents: function() {
            document.addEventListener('keydown', this._onKeydown.bind(this));
        },

        _onKeydown: function(event) {
            var seekAmount = event.shiftKey ? 30 : 5;
            seekAmount += event.ctrlKey ? 120 : 0;

            switch(event.keyCode) {
                case 37:
                    // left:
                    this.seekRelative(-seekAmount);
                    break;

                case 39:
                    // right
                    this.seekRelative(seekAmount);
                    break;

                case 32:
                    // space
                    if (this.playingState == this.PLAYING_STATES.PLAYING)
                        this.pause();
                    else
                        this.play();

                    break;
            }
        },

        /**
         * Private handler that is called when a playing song has ended
         */
        _onSongEnded: function() {
            this.playingState = this.PLAYING_STATES.STOPPED;
            this.next();
        }
    });
})(MK);

