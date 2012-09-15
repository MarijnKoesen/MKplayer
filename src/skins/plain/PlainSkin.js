(function(MK) {
    MK.PlainSkin = function(player) {
        this.player = player;

        this.mainWindow = null;
        this.mainWindowArtistLabel = null;
        this.mainWindowTitleLabel = null;
        this.mainWindowAlbumLabel = null;

        this.playlistWindow = null;
        this.playlistWindowContent = null;
        this.playlistWindow = null;

        this.playButton = null;
        this.repeatButton = null;
        this.shuffleButton = null;
        this.seeker = null;
        this.volumeSlider = null;
        this.currentTimeLabel = null;
        this.totalTimeLabel = null;
    }

    MK.extend(MK.PlainSkin.prototype, {
        init: function() {
            this.createWindows();
            this.initializeElements();
            this._disableElementSelection();
            this.registerEvents();
            this.redrawPlaylist();
        },

        /**
         * Create and initialize the windows, then append them to the body
         */
        createWindows: function() {
            // Create the mainWindow
            this.mainWindow = this.createMainWindow();
            document.body.appendChild(this.mainWindow);

            // Create the playlistWindow
            this.playlistWindow = this.createPlaylistWindow();
            document.body.appendChild(this.playlistWindow);
        },

        /**
         * Initialize all the elements and assign the element references as class vars
         */
        initializeElements: function() {
            this.mainWindowArtistLabel = this.mainWindow.getElementsByClassName('artist')[0];
            this.mainWindowTitleLabel = this.mainWindow.getElementsByClassName('title')[0];
            this.mainWindowAlbumLabel = this.mainWindow.getElementsByClassName('album')[0];
            this.playButton = this.mainWindow.getElementsByClassName('play')[0];
            this.repeatButton = this.mainWindow.getElementsByClassName('repeat')[0];
            this.shuffleButton = this.mainWindow.getElementsByClassName('shuffle')[0];
            this.seeker = this.mainWindow.getElementsByClassName('seek')[0];
            this.volumeSlider = this.mainWindow.getElementsByClassName('volumeSlider')[0];
            this.currentTimeLabel = this.mainWindow.getElementsByClassName('currentTime')[0];
            this.totalTimeLabel = this.mainWindow.getElementsByClassName('totalTime')[0];
            this.playlistWindowContent = this.playlistWindow.getElementsByTagName('table')[0];

            this.volumeSlider.value = this.player.volume;

            this.styleRepeatButton();
            this.styleShuffleButton();
        },

        /**
         * Create the playlist window
         *
         * @return object the DOM element for the main window
         */
        createMainWindow: function() {
            return MK.HtmlBuilder().build(
                {n: 'div', a: {class: 'window main'}, c: [
                    {n: 'div', a: {class: "header"}, c: [
                        {n: 'div', a: {class: "minimize"}}
                    ]},
                    {n: 'div', a: {class: "body-left"}},
                    {n: 'div', a: {class: "body-content"}, c: [
                        {n: 'div', a: {class: "label"}, t: "Title"},
                        {n: 'div', a: {class: "title"}, t: String.fromCharCode(160)},

                        {n: 'div', a: {class: "label"}, t: "Artist"},
                        {n: 'div', a: {class: "artist"}, t: String.fromCharCode(160)},

                        {n: 'div', a: {class: "label"}, t: "Album"},
                        {n: 'div', a: {class: "album"}, t: String.fromCharCode(160)},

                        {n: 'div', a: {class: "progress"}, c: [
                            {n: 'div', a: {class: "currentTime"}, t: "0:00"},
                            {n: 'input', a: {type: "range", value: 0, min: 0, max: 100, step: 0.1, class: "seek"}, e: {change: this.seek.bind(this)}},
                            {n: 'div', a: {class: "totalTime"}, t: "0:00"}
                        ]},
                        {n: 'input', a: {type: "range", value: 1, min: 0, max: 1, step: 0.05, class: "volumeSlider"}, e: {change: this.changeVolume.bind(this)}},

                        {n: 'div', a: {class: "controls"}, c: [
                            {n: 'div', a: {class: "button previous"}, t: "Previous", e: { click: this.clickPrevious.bind(this)}},
                            {n: 'div', a: {class: "button play"}, t: "Play", e: { click: this.clickPlay.bind(this)}},
                            {n: 'div', a: {class: "button pause"}, t: "Pause", e: { click: this.player.pause.bind(this.player)}},
                            {n: 'div', a: {class: "button stop"}, t: "Stop", e: { click: this.player.stop.bind(this.player)}},
                            {n: 'div', a: {class: "button next"}, t: "Next", e: { click: this.clickNext.bind(this)}},
                            {n: 'div', a: {class: "button repeat"}, t: "Repeat", e: { click: this.clickRepeat.bind(this)}},
                            {n: 'div', a: {class: "button shuffle"}, t: "Shuffle", e: { click: this.clickShuffle.bind(this)}}
                        ]}
                    ]},
                    {n: 'div', a: {class: "body-right"}},
                    {n: 'div', a: {class: "footer"}}
                ]}
            );
        },

        /**
         * Create the playlist window
         *
         * @return object the DOM element for the playlist window
         */
        createPlaylistWindow: function() {
            return MK.HtmlBuilder().build(
                {n: 'div', a: {class: 'window playlist'}, c: [
                    {n: 'div', a: {class: "header", c: [
                        {n: 'div', a: {class: "minimize"}}
                    ]}},
                    {n: 'div', a: {class: "body-left"}},
                    {n: 'div', a: {class: "body-content"}, e: { click: this.clickSong.bind(this)}, c: [
                        {n: 'table', a: {cellSpacing: 0}}
                    ]},
                    {n: 'div', a: {class: "body-right"}},
                    {n: 'div', a: {class: "footer"}}
                ]}
            );
        },

        /**
         * Create a table row for for the song
         *
         * @param song MK.Song the song to add
         * @param rowNumber int The number of the row
         */
        createSongRow: function(song, rowNumber) {
            /**
             * Because we're using tr/td we can't use ellipsis as that needs a block element.
             * In the past I've embedded a div in the name td which had the ellipsis, but this
             * greatly reduces performance when you have a large playlist.
             * This was the difference between snappy and sluggish, so I've decided to not use ellipsis anymore..
             * Maybe this is fixable by not using a table, but using divs, but this need to be checked with a big
             * playlist (100k+ items)
             */
            return MK.HtmlBuilder().build(
                {n: 'tr', a: {row: rowNumber-1}, c: [
                    {n: 'td', a: { class: 'r'}, t: rowNumber + "."},
                    {n: 'td', a: { class: 'n'}, t: song.getFullName()},
                    {n: 'td', a: { class: 'd'}, t: song.getDuration()}
                ]}
            );
        },

        /**
         * Register all of our handlers to the player
         */
        registerEvents: function() {
            this.player.addEventListener('play', this.playerOnPlay.bind(this));
            this.player.addEventListener('stop', this.playerOnStop.bind(this));
            this.player.addEventListener('playing', this.playerOnPlaying.bind(this));
            this.player.addEventListener('playlistLoaded', this.playerOnPlaylistLoaded.bind(this));
            this.player.addEventListener('volumeChanged', this.playerOnVolumeChanged.bind(this));
            this.player.addEventListener('songChanged', this.playerOnSongChanged.bind(this));
        },

        playerOnSongChanged: function(song) {
            // Handle a song change
            this.mainWindowArtistLabel.innerHTML = song.artist || "&nbsp;";
            this.mainWindowAlbumLabel.innerHTML = song.album || "&nbsp;";
            this.mainWindowTitleLabel.innerHTML= song.title || "&nbsp;";

            this.seeker.max = song.getDurationInSeconds();
            this.seeker.value = 0;

            this.totalTimeLabel.innerHTML = song.length;
            this.stylePlayButton();
        },

        playerOnPlay: function(song) {
            // Handle when the player starts to play (a new song, or a paused song)
            this.selectRow(this.player.playlist.indexOf(song));
            this.stylePlayButton();
        },

        playerOnStop : function() {
            this.seeker.value = 0;
            this.currentTimeLabel.innerHTML = '0:00';
            this.stylePlayButton();
        },

        playerOnPlaying: function(param) {
            // Update the seekbar while playing
            this.seeker.value = param.currentTime;
            this.currentTimeLabel.innerHTML = MK.secondsToTime(param.currentTime);
        },

        playerOnPlaylistLoaded: function() {
            this.redrawPlaylist();
        },

        playerOnVolumeChanged: function(newVolume) {
            this.volumeSlider.value = newVolume;
        },

        /**
         * Clear the playlist and rebuild (the DOM/html) completely
         */
        redrawPlaylist: function() {
            this.playlistWindowContent.innerHTML = '';

            var table = MK.HtmlBuilder().build({n: 'table', a: {cellSpacing: 0}});

            var i = 0, song;
            while ((song = this.player.playlist[i++])) {
                table.appendChild(this.createSongRow(song, i));
            }

            if (this.playlistWindowContent.parentNode)
                this.playlistWindowContent.parentNode.removeChild(this.playlistWindowContent);

            this.playlistWindow.getElementsByClassName('body-content')[0].appendChild(table);
            this.playlistWindowContent = table;
        },

        /**
         * Select row 'rowNumber'
         *
         * If 'row' is specified, no lookup needs to be done and thus is faster
         *
         * @param rowNumber int The row number to select
         * @param row object The table row object for the row
         */
        selectRow: function(rowNumber, row) {
            if (!row)
                row = this.playlistWindowContent.childNodes[rowNumber];

            // Unmark the previous playing row as playing
            if (this.currentPlayingTableRow)
                this.currentPlayingTableRow.className = this.currentPlayingTableRow.className.replace(/\s*currentlyPlaying/, "");

            // Mark the current row as playing
            row.className = (row.className + " currentlyPlaying").trim();
            this.currentPlayingTableRow = row;
        },

        /**
         * Event handler for when users click on a song in the playlist
         *
         * @param event The click event
         */
        clickSong: function(event) {
            // First get the table row for the playlist entry
            var tableRow = event.target;
            while(tableRow && tableRow.nodeName != 'TR') {
                tableRow = tableRow.parentElement;
            }

            this.seeker.value = 0;

            // Now select the row and play the song
            this.selectRow(tableRow.getAttribute('row'), tableRow);
            this.player.play(tableRow.getAttribute('row'));

            return false;
        },

        clickPlay: function() {
            this.player.play();
            this.stylePlayButton();
        },

        /**
         * Handle the repeat button click
         *
         * @param event
         */
        clickRepeat: function(event) {
            if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_NONE)
                this.player.setRepeatState(this.player.REPEAT_STATES.REPEAT_ALL);
            else if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_ALL)
                this.player.setRepeatState(this.player.REPEAT_STATES.REPEAT_ONE);
            else
                this.player.setRepeatState(this.player.REPEAT_STATES.REPEAT_NONE);

            this.styleRepeatButton();
        },

        /**
         * Handle the shuffle button click
         *
         * @param event
         */
        clickShuffle: function(event) {
            this.player.shuffle = !this.player.shuffle;
            this.styleShuffleButton();
        },

        /**
         * Handle the next button click
         *
         * @param event
         */
        clickNext: function() {
            this.seeker.value = 0; // Show instant feedback
            this.player.next();
            this.ensureCurrentSongIsVisible();
        },

        /**
         * Handle the previous button click
         *
         * @param event
         */
        clickPrevious: function() {
            this.seeker.value = 0; // Show instant feedback
            this.player.previous();
            this.ensureCurrentSongIsVisible();
        },

        clickSeekBackward: function() {
            this.player.seek(this.player.audioEngine.currentTime - 5);
        },

        clickSeekForward: function() {
            this.player.seek(this.player.audioEngine.currentTime + 5);
        },

        /**
         * Handle the seek bar drag event
         *
         * @param event
         */
        seek: function(event) {
            this.player.seek(event.target.value);
        },

        /**
         * Handle the volume bar drag event
         *
         * @param event
         */
        changeVolume: function(event) {
            this.player.setVolume(event.target.value);
        },


        /**
         * Automatically adjust the scroll position of the playlist to make sure the current playing song is visible
         */
        ensureCurrentSongIsVisible: function() {
            var currentScroll = parseInt(this.playlistWindowContent.parentNode.scrollTop);
            var viewPortHeight = this.playlistWindowContent.parentNode.offsetHeight;
            var songY = this.currentPlayingTableRow.offsetTop;
            if (songY < currentScroll + 40) {
                this.playlistWindowContent.parentNode.scrollTop = songY - 50;
            } else if (songY > currentScroll + viewPortHeight - 50) {
                this.playlistWindowContent.parentNode.scrollTop = songY - viewPortHeight + 60;
            }
        },

        /**
         * Synchronize the styling of the repeat button with the current repeat setting of the player
         */
        styleRepeatButton: function() {
            if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_ALL)
                this.repeatButton.innerHTML = "Repeat: all";
            else if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_NONE)
                this.repeatButton.innerHTML = "Repeat: none";
            else if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_ONE)
                this.repeatButton.innerHTML = "Repeat: one";
        },

        /**
         * Synchronize the styling of the shuffle button with the current shuffle setting of the player
         */
        styleShuffleButton: function() {
            if (this.player.shuffle)
                this.shuffleButton.innerHTML = "Shuffle: on";
            else
                this.shuffleButton.innerHTML = "Shuffle: off";
        },

        /**
         * Synchronize the styling of the play button with the current players state
         */
        stylePlayButton: function() {
            // The plain skin doesn't need to style the play button, but sub skins do
        },

        _disableElementSelection: function() {
            // chrome
            // Note: This was really slow when you drag something (hold the mouse down and move it)
            //       chrome is a real PITA when it concerns no-select, it's REALLY slow.
            //document.body.style.webkitUserSelect = "none";

            // Note 2: this seems to work the fastest...
            document.onselectstart = function() {
                // ie & chrome
                return false;
            }

            // firefox (this doesn't work ;()
            //document.body.style.MozUserSelect = "none";
        }
    })
})(MK);

