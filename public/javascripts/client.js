$(document).ready(function(){

  /* Rdio Flash player setup */
  $.getJSON('/flashvars', function (data) {
    var flashvars = data;
    flashvars['listener'] = 'Chattradio.RdioListener';
    var params = { 'allowScriptAccess': 'always' };
    var attributes = {};
    swfobject.embedSWF('http://rdio.com/api/swf/',
                       'rdioswf',
                       1, 1, '9.0.0',
                       'expressInstall.swf',
                       flashvars,
                       params,
                       attributes);
  });

  /* Inform the server of our position in the song periodically */
  var songPlaying = false;
  setInterval(function() {
    if (songPlaying) { // jhawk temp hack
      var pos = this.getPosition();
      now.updatePosition(pos);
    }
  }, 5000);

  /* Join a room */
  $("#join-channel").keydown(function(e){
    now.registerUser();
    var code = (e.keyCode) ? e.keyCode : e.which,
        roomName = $("#join-channel").val();

    if (!roomName || roomName.length < 1 || code !== 13) {
      return;
    }
    e.preventDefault();

    now.join(roomName);
    songPlaying = true;
    $("#join-channel").val("");
  });

  /* Send a message */
  $("#message").keydown(function(e){
    var code = (e.keyCode) ? e.keyCode : e.which,
        msg = $("#message").val();

    if (!msg || msg.length < 1 || code !== 13) {
      return;
    }
    e.preventDefault();

    now.distributeMessage(msg);
    $("#message").val("");
  });

  // jhawk temporary position tracking
  var counter = 0;
  getPosition = function() {
    return ++counter;
  }

  /* Receive a message */
  now.receiveMessage = function(name, message){
    $("#chat-log").append("<br>" + name + ": " + message);
  }

  /* Play a song at a position */
  now.playAt = function(id, pos){

  }

  now.pause = function() {

  }

});

var Chattradio = Chattradio || {};

Chattradio.rdioswf = null;
Chattradio.track = null;

Chattradio.RdioListener = {

  ready: function() {
    Chattradio.rdioswf = $('#rdioswf').get(0);
    // uncomment this to test hard-coded playback
    Chattradio.rdioswf.rdio_play("t7349349");
    $.getJSON('/info', function (data) {
      console.log('kurt');
      Chattradio.track = data.result.t7349349;
      console.log(Chattradio.track);
      $('#artistinfo').html(Chattradio.track.artist + ' - ' + Chattradio.track.name);
      $('#albumart').attr('src', Chattradio.track.icon);
    });
  },

  playStateChanged: function (state) {
    console.log('playStateChanged: ' + state);
  },

  playingTrackChanged: function (track, pos) {
    console.log('playingTrackChanged: ' + track + ', pos: ' + pos);
  },

  playingSourceChanged: function (source) {
    console.log('playingSourceChanced: ' + source);
  },

  volumeChanged: function (vol) {
    console.log('volumeChanged: ' + vol);
  },

  muteChanged: function (mute) {
    console.log('muteChanged: ' + mute);
  },

  positionChanged: function (position) {
    if (position <= 0) { return; }

    var percent = position / Math.floor(Chattradio.track.duration) * 100;
    $('.preslider').css('width', percent + '%');
    console.log('positionChanged: ' + position);
    console.log('percent: ' + percent);
    console.log('duration: ' + Chattradio.track.duration);
  },

  shuffleChanged: function (shuffle) {
    console.log('shuffleChanged: ' + shuffle);
  },

  queueChanged: function (queue) {
    console.log('queueChanged: ' + queue);
  },

  repeatChanged: function (repeat) {
    console.log('repeatChanged: ' + repeat);
  },

  playingSomewhereElse: function () {
    console.log('Why would you play somewhere else? Why?');
  }

};

