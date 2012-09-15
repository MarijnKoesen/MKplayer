(function(MK) {
    MK.FancySkin = function(player) {
        this.player = player;
    }

    MK.FancySkin.prototype = new MK.PlainSkin();

    MK.extend(MK.FancySkin.prototype, {
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
        }
    });
})(MK);
