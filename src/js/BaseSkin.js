(function(MK) {
    MK.BaseSkin = function(player) {
        this.player = player;

        this.mainWindow;
        this.mainWindowArtistLabel;
        this.mainWindowTitleLabel;
        this.mainWindowAlbumLabel;

        this.playlistWindow;
        this.playlistWindowContent;

        this.playlistWindow;
        this.searchWindow;

        this.init();
    }

    MK.extend(MK.BaseSkin.prototype, {
        init: function() {
            this.createWindows();
            this.registerEvents();

            this.redrawPlaylist();
        },

        /**
         * Create and initialize the windows, then append them to the body
         */
        createWindows: function() {
            this.mainWindow = this.createMainWindow();
            this.mainWindowArtistLabel = this.mainWindow.getElementsByClassName('artist')[0];
            this.mainWindowTitleLabel = this.mainWindow.getElementsByClassName('title')[0];
            this.mainWindowAlbumLabel = this.mainWindow.getElementsByClassName('album')[0];
            this.styleRepeatButton();
            this.styleShuffleButton();
            this.mainWindow.getElementsByClassName('volume')[0].value = this.player.volume;
            document.body.appendChild(this.mainWindow);

            this.playlistWindow = this.createPlaylistWindow();
            this.playlistWindowContent = this.playlistWindow.getElementsByTagName('table')[0];
            document.body.appendChild(this.playlistWindow);
        },

        /**
         * Create the playlist window
         *
         * @return object the DOM element for the main window
         */
        createMainWindow: function() {
            return MK.HtmlBuilder().build(
                {n: 'div', a: {'id': 'mainWindow', class: 'window'}, c: [
                    {n: 'div', a: {class: "header", c: [
                        {n: 'div', a: {class: "minimize"}}
                    ]}},
                    {n: 'div', a: {class: "body-left"}},
                    {n: 'div', a: {class: "body-content"}, c: [
                        {n: 'div', a: {class: "label"}, t: "Artist"},
                        {n: 'div', a: {class: "artist"}, t: String.fromCharCode(160)},

                        {n: 'div', a: {class: "label"}, t: "Title"},
                        {n: 'div', a: {class: "title"}, t: String.fromCharCode(160)},

                        {n: 'div', a: {class: "label"}, t: "Album"},
                        {n: 'div', a: {class: "album"}, t: String.fromCharCode(160)},

                        {n: 'input', a: {type: "range", value: 0, min: 0, max: 100, step: 0.1, class: "seek"}, e: {change: this.seek.bind(this)}},
                        {n: 'input', a: {type: "range", value: 1, min: 0, max: 1, step: 0.05, class: "volume"}, e: {change: this.changeVolume.bind(this)}},

                        {n: 'div', a: {class: "controls"}, c: [
                            {n: 'div', a: {class: "button previous"}, t: "Previous", e: { click: this.clickPrevious.bind(this)}},
                            {n: 'div', a: {class: "button play"}, t: "Play", e: { click: this.player.play.bind(this.player)}},
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
                {n: 'div', a: {'id': 'playlistWindow', class: 'window'}, c: [
                    {n: 'div', a: {class: "header", c: [
                        {n: 'div', a: {class: "minimize"}}
                    ]}},
                    {n: 'div', a: {class: "body-left"}},
                    {n: 'div', a: {class: "body-content"}, c: [
                        {n: 'table', a: {cellSpacing: 0}}
                    ]},
                    {n: 'div', a: {class: "body-right"}},
                    {n: 'div', a: {class: "footer"}}
                ]}
            );
        },

        /**
         * Register all of our handlers to the player
         */
        registerEvents: function() {
            this.player.addEventListener('play', (function(song) {
                // Handle a song change
                this.mainWindowArtistLabel.innerHTML = song.artist || "&nbsp;";
                this.mainWindowAlbumLabel.innerHTML = song.album || "&nbsp;";
                this.mainWindowTitleLabel.innerHTML= song.title || "&nbsp;";

                var seeker =  this.mainWindow.getElementsByClassName('seek')[0];
                seeker.value = 0;
                seeker.max = song.getDurationInSeconds();

                this.selectRow(this.player.playlist.indexOf(song));
            }).bind(this));

            this.player.addEventListener('stop', (function(song) {
                this.mainWindowArtistLabel.innerHTML = "&nbsp;";
                this.mainWindowAlbumLabel.innerHTML = "&nbsp;";
                this.mainWindowTitleLabel.innerHTML= "&nbsp;";
            }).bind(this));

            this.player.addEventListener('playing', (function(attr) {
                // Update the seekbar while playing
                this.mainWindow.getElementsByClassName('seek')[0].value = (attr.currentTime);
            }).bind(this));

            this.player.addEventListener('playlistLoaded', (function() {
                this.redrawPlaylist();
            }).bind(this));

            this.player.addEventListener('volumeChanged', (function(newVolume) {
                this.mainWindow.getElementsByClassName('volume')[0].value = newVolume;
            }).bind(this));
        },

        /**
         * Clear the playlist and rebuild completely
         */
        redrawPlaylist: function() {
            this.playlistWindowContent.innerHTML = '';

            var i = 0, song;
            while ((song = this.player.playlist[i++])) {
                this.playlistWindowContent.appendChild(this.createSongRow(song, i));
            }
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

            // Now select the row and play the song
            this.selectRow(tableRow.getAttribute('row'), tableRow);
            this.player.play(tableRow.getAttribute('row'));

            return false;
        },

        /**
         * Handle the repeat button click
         *
         * @param event
         */
        clickRepeat: function(event) {
            this.player.repeat = !this.player.repeat;
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
            this.player.next();
            this.makeSureCurrentSongIsVisible();
        },

        /**
         * Handle the previous button click
         *
         * @param event
         */
        clickPrevious: function() {
            this.player.previous();
            this.makeSureCurrentSongIsVisible();
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
        makeSureCurrentSongIsVisible: function() {
            if (parseInt(this.playlistWindow.scrollTop + parseInt(this.playlistWindow.offsetHeight) - 50) < parseInt(this.currentPlayingTableRow.offsetTop)) {
                this.playlistWindow.scrollTop = this.currentPlayingTableRow.offsetTop - 50;
            } else if (parseInt(this.playlistWindow.scrollTop) > parseInt(this.currentPlayingTableRow.offsetTop)) {
                this.playlistWindow.scrollTop = this.currentPlayingTableRow.offsetTop - 50;
            }
        },

        /**
         * Synchronize the styling of the repeat button with the current repeat setting of the player
         */
        styleRepeatButton: function() {
            var button = this.mainWindow.getElementsByClassName('repeat')[0];

            if (this.player.repeat)
                button.innerHTML = "Repeat: on";
            else
                button.innerHTML = "Repeat: off";
        },

        /**
         * Synchronize the styling of the shuffle button with the current shuffle setting of the player
         */
        styleShuffleButton: function() {
            var button = this.mainWindow.getElementsByClassName('shuffle')[0];

            if (this.player.shuffle)
                button.innerHTML = "Shuffle: on";
            else
                button.innerHTML = "Shuffle: off";
        },


        /**
         * Create a table for for the song
         * @param song MK.Song the song to add
         * @param rowNumber int The number of the row
         */
        createSongRow: function(song, rowNumber) {
            return MK.HtmlBuilder().build(
                {n: 'tr', a: {row: rowNumber-1}, e: { click: this.clickSong.bind(this)}, c: [
                    {n: 'td', a: { class: 'r'}, t: rowNumber + "."},
                    {n: 'td', a: { class: 'n'}, c: [{n: 'div', t: song.getFullName()}]},
                    {n: 'td', a: { class: 'd'}, t: song.getDuration()}
                ]}
            );
        }
    })
})(MK);

