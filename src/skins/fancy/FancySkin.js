(function(MK) {
    MK.FancySkin = function(player) {
        this.player = player;

        this.scroller = null;
    }

    MK.FancySkin.prototype = new MK.PlainSkin();

    MK.extend(MK.FancySkin.prototype, {
        initializeElements: function() {
            // First call the parent implementation
            MK.PlainSkin.prototype.initializeElements.call(this);

            this._initializeScrollbar();
            this._makeResizable();
        },

        _initializeScrollbar: function() {
            // Now initialize our custom scrollbar
            this.scroller = this.playlistWindow.getElementsByClassName('scroller')[0];
            MK.draggable(this.scroller, {
                dragX: false,
                drag: this.handleScrollerDrag.bind(this)
            });

            // Update the scroller when we natively scroll the playlist
            this.playlistWindowContent.parentNode.addEventListener('scroll', this.handlePlaylistWindowScroll.bind(this));
        },

        _makeResizable: function() {
            // Make the window resizable
            MK.draggable(this.playlistWindow.getElementsByClassName('footer-right')[0], {
                moveElement: false,
                drag: this.handlePlaylistResize.bind(this)
            });
            MK.draggable(this.playlistWindow.getElementsByClassName('body-right')[0], {
                moveElement: false,
                drag: this.handlePlaylistResize.bind(this)
            });
            MK.draggable(this.playlistWindow.getElementsByClassName('footer-stretch')[0], {
                moveElement: false,
                drag: this.handlePlaylistResize.bind(this)
            });
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
                        {n: 'div', a: {class: "title"}, h: "&nbsp;"},
                        {n: 'div', a: {class: "artist"}, h: "&nbsp;"},
                        {n: 'div', a: {class: "album"}, h: "&nbsp;"},

                        {n: 'div', a: {class: "progress"}, c: [
                            {n: 'div', a: {class: "currentTime"}, t: "0:00"},
                            {n: 'input', a: {type: "range", value: 0, min: 0, max: 100, step: 0.1, class: "seek"}, e: {change: this.seek.bind(this)}},
                            {n: 'div', a: {class: "totalTime"}, t: "0:00"}
                        ]},

                        {n: 'div', a: {class: "controls"}, c: [
                            {n: 'div', a: {class: "button previous"}, e: { click: this.clickPrevious.bind(this)}},
                            {n: 'div', a: {class: "button seek-backward"}, e: { mousedown: this.clickSeekBackward.bind(this)}},
                            {n: 'div', a: {class: "button play"}, e: { click: this.clickPlay.bind(this)}},
                            {n: 'div', a: {class: "button seek-forward"}, e: { mousedown: this.clickSeekForward.bind(this)}},
                            {n: 'div', a: {class: "button next"}, e: { click: this.clickNext.bind(this)}},
                            {n: 'div', a: {class: "button volume"}, c: [
                                {n: 'input', a: {type: "range", value: 1, min: 0, max: 1, step: 0.05, class: "volumeSlider"}, e: {change: this.changeVolume.bind(this)}},
                            ]},
                            {n: 'div', a: {class: "button repeat"}, e: { click: this.clickRepeat.bind(this)}},
                            {n: 'div', a: {class: "button shuffle"}, e: { click: this.clickShuffle.bind(this)}}
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
                    {n: 'div', a: {class: "header"}, c: [
                        {n: 'div', a: {class: "header-stretch"}},
                        {n: 'div', a: {class: "header-left"}},
                        {n: 'div', a: {class: "header-right"}}
                    ]},
                    {n: 'div', a: {class: "body"}, c: [
                        {n: 'div', a: {class: "body-left"}},
                        {n: 'div', a: {class: "body-content"}, e: { click: this.clickSong.bind(this)}, c: [
                            {n: 'table', a: {cellSpacing: 0}}
                        ]},
                        {n: 'div', a: {class: "body-right"}, c: [
                            {n: 'div', a: {class: "scroller"}}
                        ]}
                    ]},
                    {n: 'div', a: {class: "footer"}, c:[
                        {n: 'div', a: {class: "footer-stretch"}},
                        {n: 'div', a: {class: "footer-left"}},
                        {n: 'div', a: {class: "footer-right"}}
                    ]}
                ]}
            );
        },

        /**
         * Synchronize the styling of the play button with the current players state
         */
        stylePlayButton: function() {
            if (this.player.playingState == this.player.PLAYING_STATES.PLAYING)
                this.playButton.className = this.playButton.className.replace(" play", " pause");
            else
                this.playButton.className = this.playButton.className.replace(" pause", " play");
        },

        /**
         * Synchronize the styling of the repeat button with the current repeat setting of the player
         */
        styleRepeatButton: function() {
            if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_ALL)
                this.repeatButton.className = "button repeat all";
            else if (this.player.repeatState == this.player.REPEAT_STATES.REPEAT_ONE)
                this.repeatButton.className = "button repeat one";
            else
                this.repeatButton.className = "button repeat none";
        },

        /**
         * Synchronize the styling of the shuffle button with the current shuffle setting of the player
         */
        styleShuffleButton: function() {
            if (this.player.shuffle)
                this.shuffleButton.className = "button shuffle on";
            else
                this.shuffleButton.className = "button shuffle off";
        },

        clickPlay: function() {
            if (this.player.playingState == player.PLAYING_STATES.PLAYING) {
                this.player.pause();
            } else {
                this.player.play();
            }

            this.stylePlayButton();
        },

        /**
         * Update the native scroll position when the scroll handle is being dragged
         */
        handleScrollerDrag: function() {
            var scrollPercentage = this.scroller.offsetTop / (this.scroller.parentNode.offsetHeight - this.scroller.offsetHeight);
            var maxScroll = this.playlistWindowContent.offsetHeight;
            this.playlistWindowContent.parentNode.scrollTop = maxScroll * scrollPercentage;
        },

        /**
         * Update the position of the scroll handle when the playlist is natively scrolled,
         */
        handlePlaylistWindowScroll: function() {
            var scrollPercentage = this.playlistWindowContent.parentNode.scrollTop / (this.playlistWindowContent.offsetHeight - this.playlistWindowContent.parentNode.offsetHeight);
            var maxScrollerPos = this.scroller.parentNode.offsetHeight - this.scroller.offsetHeight;
            this.scroller.style.top = Math.round(maxScrollerPos * scrollPercentage) + "px";
        },

        /**
         * Handle the drag event when the playlist is being resized
         *
         * @param event
         */
        handlePlaylistResize: function(event, element) {
            var topLeftCorner = MK.getAbsolutePosition(this.playlistWindow);
            var mousePos = {x: event.clientX, y: event.clientY};

            if (!element.className.match(/footer-stretch/)) {
                var newWidth = mousePos.x - topLeftCorner.x
                if (newWidth > 200)
                    this.playlistWindow.style.width = newWidth + "px";
            }

            if (!element.className.match(/body-right/)) {
                var newHeight = mousePos.y - topLeftCorner.y;
                if (newHeight > 100)
                    this.playlistWindow.style.height = newHeight + "px";
            }
        }
    });
})(MK);
