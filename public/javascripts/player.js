$(document).ready(function() {
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

