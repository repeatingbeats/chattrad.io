var Chattradio = Chattradio || {};

Chattradio.Player = (function(){

  var track = null,
      seekTo = null,
      player;

  player = {

    init: function Player_init(flashvars) {
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
    },

    play: function Player_play(id, pos) {
      var self = this,
          swf = Chattradio.rdioswf,
          volume = sessionStorage.getItem('volume');

      if (volume) {
        // Init swf player volume
        swf.rdio_setMute(Boolean(sessionStorage.getItem('mute')));
        swf.rdio_setVolume(parseInt(volume) / 100);
      }

      swf.rdio_play(id);
      if (pos && pos > 0) {
        // Seek won't work until playback starts :(
        // Set a flag so we seek if necessary on the state change
        seekTo = pos;
      }

      $.getJSON('/info/' + id, function (data) {
        track = data.result[id];
        $('#songtitle > a').html(track.name);
        $('#artistname > a').html(track.artist);
        $('#albumart').attr('src', track.icon);
      });

    },

    deferredSeek: function Player_deferredSeek() {
      if (seekTo) {
        console.log('seeking to ' + seekTo);
        Chattradio.rdioswf.rdio_seek(seekTo);
        seekTo = null;
      }
    },

    getCurrentTrack: function Player_getCurrentTrack() {
      return track;
    }

  };

  return player;

}());

Chattradio.RdioListener = (function() {

  var isReady = false,
      player = Chattradio.Player,
      listener;

  listener = {

    isReady: function () {
      return isReady;
    },

    ready: function() {
      console.log('player ready');
      Chattradio.rdioswf = $('#rdioswf').get(0);
      isReady = true;
      this.trigger('ready');
    },

    playStateChanged: function (state) {
      console.log('playStateChanged: ' + state);
      if (state == 3) {
        // Now that we're playing, see if we need to seek.
        player.deferredSeek();
      }
    },

    playingTrackChanged: function (track, pos) {
      console.log('playingTrackChanged: ' + track + ', pos: ' + pos);

      // pos == -1 means we got to the end of the current track
      if (pos == -1) {
        now.trackFinished(player.getCurrentTrack().key);
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
      var duration = player.getCurrentTrack().duration,
          percent = position / Math.floor(duration) * 100;

      $('#elapsed').html(calculateTime(position));
      $('#duration').html(calculateTime(duration));
      $('#seek').css('width', percent + '%');
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

  Chattradio.mixin(listener, Chattradio.events);

  return listener;

}());

/* Helper functions */
function calculateTime(seconds) {
  var mins = Math.floor(seconds / 60),
      secs = Math.floor(seconds % 60);

  if (secs < 10) {
    secs = '0' + secs;
  }

  return mins + ':' + secs;
}

$(document).ready(function() {

  /* Rdio Flash player setup */
  $.getJSON('/flashvars', Chattradio.Player.init);

  // Volume initialization
  var initVolume = sessionStorage.getItem('volume');
  if (initVolume) {
    $('#volctl').width(initVolume + '%');
  } else {
    $('#volctl').width('100%');
  }

  // Volume control
  $('#volbtn').click(function(event) {
    var mute = sessionStorage.getItem('mute'),
        volume = sessionStorage.getItem('volume'),
        swf = (typeof(Chattradio) !== 'undefined') ?
                Chattradio.rdioswf : null;

    if (mute === 'false') {
      sessionStorage.setItem('mute', true);
      sessionStorage.setItem('volume', $('#volctl').width());
      $('#volctl').width('0%');
      $('#volbtn').css('background-image',
                       'url("/images/mute.png")');
      if (swf) {
        swf.rdio_setMute(true);
      }
    } else {
      sessionStorage.setItem('mute', false);
      $('#volctl').width(volume + '%');
      $('#volbtn').css('background-image',
                       'url("/images/volume.png")');
      if (swf) {
        swf.rdio_setMute(false);
        swf.rdio_setVolume(volume / 100);
      }
    }
  });

  $('#volume').mousedown(function(event) {
    setVolume(event, $(this));
    $(this).mousemove(function(event) {
      $(this).addClass('dragging');
      setVolume(event, $(this));
    });
  });

  $('#volume').click(function(event) {
    setVolume(event, $(this));
  });

  $('#volume').mouseup(function(event) {
    removeVolumeHandlers($(this));
  });

  $('#volume').mouseleave(function(event) {
    removeVolumeHandlers($(this));
  });

  function setVolume(event, slider) {
    var pos = slider.offset(),
        left = pos.left,
        top = pos.top,
        clientX = event.clientX,
        clientY = event.clientY,
        height = slider.height(),
        width = slider.width(),
        percent = event.offsetX * 100 / slider.width(),
        mute = (percent === 0),
        swf = (typeof(Chattradio) !== 'undefined') ?
                Chattradio.rdioswf : null,
        img = (mute) ?
                'url("/images/mute.png")' : 'url("/images/volume.png")';

    if (clientX <= left || clientX >= (left + width) ||
        clientY <= top || clientY >= (top + height)) {
      removeVolumeHandlers(slider)
    } else {
      $('#volctl').width(percent + '%');

      sessionStorage.setItem('volume', percent);
      sessionStorage.setItem('mute', mute);
      $('#volbtn').css('background-image', img);

      if (swf) {
        swf.rdio_setVolume(percent / 100);
        swf.rdio_setMute(mute);
      }
    }

    event.preventDefault();
  }

  function removeVolumeHandlers(slider) {
    slider.removeClass('dragging');
    slider.unbind('mousemove');
  }
});;

