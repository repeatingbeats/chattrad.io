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

  now.receiveJoin = function(name) {
    var chatlog = $('#chat-log'),
        scrollHeight;

    chatlog.append('<br>' + name + ' joined.');
    scrollHeight = chatlog.attr("scrollHeight");
    chatlog.attr("scrollTop", scrollHeight);
  }

  now.receivePart = function(name) {
    var chatlog = $('#chat-log'),
        scrollHeight;

    chatlog.append('<br>' + name + ' left.');
    scrollHeight = chatlog.attr("scrollHeight");
    chatlog.attr("scrollTop", scrollHeight);
  }

  /* Receive a message */
  now.receiveMessage = function(name, message){
    var chatlog = $('#chat-log'),
        scrollHeight;

    chatlog.append("<br>" + name + ": " + message);
    scrollHeight = chatlog.attr("scrollHeight");
    chatlog.attr("scrollTop", scrollHeight);
  }

  /* Play a song at a position */
  now.playAt = function(id, pos){

    function waitForReady() {
      if (Chattradio.RdioListener.isReady) {
        Chattradio.rdioswf.rdio_play(id);
        if (pos > 0) {
          // Seek won't work until playback starts :(
          // Set a flag so we seek if necessary on the state change
          Chattradio.seekTo = pos;
        }
        $.getJSON('/info/' + id, function (data) {
          Chattradio.track = data.result[id];
          $('#artistinfo').html(Chattradio.track.artist + ' - ' + Chattradio.track.name);
          $('#albumart').attr('src', Chattradio.track.icon);
        });
      } else {
        setTimeout(function () { waitForReady() }, 500);
      }
    }

    waitForReady();

  }

  now.pause = function() {
  }

});

var Chattradio = Chattradio || {};

Chattradio.rdioswf = null;
Chattradio.track = null;
Chattradio.seekTo = null;

Chattradio.RdioListener = {

  isReady: false,

  ready: function() {
    Chattradio.rdioswf = $('#rdioswf').get(0);
    this.isReady = true;
    console.log('ready');
  },

  playStateChanged: function (state) {
    console.log('playStateChanged: ' + state);
    if (Chattradio.seekTo && state == 3) {
      console.log('seeking to ' + Chattradio.seekTo);
      Chattradio.rdioswf.rdio_seek(Chattradio.seekTo);
      Chattradio.seekTo = null;
    }
  },

  playingTrackChanged: function (track, pos) {
    console.log('playingTrackChanged: ' + track + ', pos: ' + pos);
    // pos == -1 means we got to the end of the current track
    if (pos == -1) {
      now.trackFinished(Chattradio.track.key);
    }
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
    now.updatePosition(position);
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

