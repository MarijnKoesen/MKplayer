### MKplayer

MKplayer is a HTML5 player written in javascript that enables you to listen to your music anywhere and anytime on any device!

Because it's built to run in your webbrowser you can use your desktop at home or at work and use your smartphone when you're on the move.

The only requirement is that you have a server where you can host the files and have the mp3 files on the same server.

### Requirements

* A webserver
* Mp3s

### Installation and usage

To install the player unpack the files on your server and create a html file like this:

```html
<link rel="stylesheet" type="text/css" media="all" href="/MKplayer/css/MKplayer.min.css" />
<script type="text/javascript" src="/MKplayer/js/MKplayer.min.js"></script>

<script>
window.onload = function() {
    player = new MK.Player();

    // Add songs with javascript
    player.addSong(new MK.Song({
        title: "Some manual song title", 
        artist: "Some artist", 
        album: "Some album", 
        year: "1999", 
        url: "/some_file_.mp3", 
        length: "2:34"
    }));

    // Or load a playlist
    player.loadPlaylist('/examples/playlistSample.html');

    // Now load a skin and your ready to play the music
    skin = new MK.BaseSkin(player);

    // If you want to control the player yourself you can:
    player.previous();
    player.play();
    player.stop();
    player.next();
    player.pause();
    player.setVolume(0.75);
    player.seek(20);
    player.repeat = true;
    player.shuffle = false;
}
</script>
```html

### Authors and Contributors

MKplayer has been creating by Marijn Koesen (@marijnkoesen).
