(function(MK) {
    MK.FancySkin = function(player) {
        this.player = player;

        this.scroller = null;
    }

    MK.FancySkin.prototype = new MK.BaseSkin();

    MK.extend(MK.FancySkin.prototype, {
        initializeElements: function() {
            // First call the parent implementation
            MK.BaseSkin.prototype.initializeElements.call(this);

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

            MK.draggable(this.playlistWindow, {strict: false, dragStart: this.handlePlaylistWindowMoveStart.bind(this)});
            MK.draggable(this.mainWindow, {strict: true});

            // Update the scroller when we natively scroll the playlist
            this.playlistWindowContent.parentNode.addEventListener('scroll', this.handlePlaylistWindowScroll.bind(this));
        },

        _makeResizable: function() {
            // Make the window resizable
            MK.draggable(this.playlistWindow.getElementsByClassName('footer-right')[0], {
                drag: this.handlePlaylistResize.bind(this)
            });
            MK.draggable(this.playlistWindow.getElementsByClassName('body-right')[0], {
                drag: this.handlePlaylistResize.bind(this)
            });
            MK.draggable(this.playlistWindow.getElementsByClassName('footer-stretch')[0], {
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
                            {n: 'input', a: {type: "range", value: 0, min: 0, max: 100, step: 0.1, class: "seek"}, e: {mouseup: this.seek.bind(this), mousedown: function() { this.mouseIsDown=true; }}},
                            {n: 'div', a: {class: "totalTime"}, t: "0:00"}
                        ]},

                        {n: 'div', a: {class: "controls"}, c: [
                            {n: 'div', a: {class: "button previous"}, e: { click: this.clickPrevious.bind(this)}},
                            {n: 'div', a: {class: "button seek-backward"}, e: { mousedown: this.clickSeekBackward.bind(this)}},
                            {n: 'div', a: {class: "button play"}, e: { click: this.clickPlay.bind(this)}},
                            {n: 'div', a: {class: "button seek-forward"}, e: { mousedown: this.clickSeekForward.bind(this)}},
                            {n: 'div', a: {class: "button next"}, e: { click: this.clickNext.bind(this)}},
                            {n: 'div', a: {class: "button volume"}, c: [
                                {n: 'input', a: {type: "range", value: 1, min: 0, max: 1, step: 0.01, class: "volumeSlider"}, e: {change: this.changeVolume.bind(this)}}
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
			var dimensions = MK.Settings.get('playlist_size');
			if (dimensions && dimensions.match(/^[0-9]+,[0-9]+$/))
				dimensions = dimensions.split(',');
			else
				dimensions = ['',''];

            return MK.HtmlBuilder().build(
                {n: 'div', a: {class: 'window playlist', style: 'width:'+dimensions[0]+'px; height:'+dimensions[1]+'px'}, c: [
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

        redrawPlaylist: function() {
            // First call the parent class
            MK.BaseSkin.prototype.redrawPlaylist.call(this);

            // Now update our custom scrollbar to reflect the new playlist length/height
            this.handlePlaylistWindowScroll();
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

        handlePlaylistWindowMoveStart: function(event) {
            // TODO implement this in the draggable helper with an 'allowed elements'
            var allowedElements = ['body-left', 'header-left', 'header-stretch'];

            for (var i = 0; i < allowedElements.length; i++) {
                // Check if the mouse is over one of the allowed elements, if so, allow dragging, else deny it
                var element = this.playlistWindow.getElementsByClassName(allowedElements[i])[0];
                var elementPos = MK.getAbsolutePosition(element);

                var xOk = (event.clientX > elementPos.x) && event.clientX < (elementPos.x + element.offsetWidth);
                var yOk = event.clientY > elementPos.y && event.clientY < (elementPos.y + element.offsetHeight);
                if (xOk && yOk)
                    return true;
            }

            return false;
        },

        /**
         * Handle the resize event for the playlist, changing the width of the window and position of the scrollbar
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

                this.handlePlaylistWindowScroll();
            }

			MK.Settings.set('playlist_size', newWidth + ',' + newHeight);

            // Don't actually move the element
            return false;
        },

		/**
		 * Handle the seek-bar drag event
		 *
		 * @param event
		 */
		seek: function(event) {
			this.player.seek(parseFloat(event.target.value));
			event.target.mouseIsDown = false;
		}
    });
})(MK);
