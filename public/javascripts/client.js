$(document).ready(function(){

  var listener = Chattradio.RdioListener,
      player = Chattradio.Player;

  /* Join a room via landing */
  $("#newroomform").submit(function(e){
    var lfmUser = $("#lfmuser").val();

    if (!lfmUser || lfmUser.length < 1) {
      e.preventDefault();
      alert('You must specify a valid Last.fm username to create a room');
      return false;
    }

    $("#spinner").removeAttr("invisible");
    $("#newroomsubmit").attr("disabled", "true");

    $("#availrooms").click(function(e) { e.preventDefault() } );
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

  now.receiveJoin = function(username) {
    var chatlog = $('#chat-log'),
        scrollHeight;

    chatlog.append('<br>' + username + ' joined.');
    scrollHeight = chatlog.attr("scrollHeight");
    chatlog.attr("scrollTop", scrollHeight);
  };

  now.receiveLeave = function(username) {
    $('#chat-log').append('<br>' + username + ' left.');
    $('#' + username).remove();
  };

  now.updateUsers = function(users) {
    var userlist = $('#users'),
        userobj = (users) ? JSON.parse(users) : null;

    for (var username in userobj) {
      if ($('#' + username).length > 0) { continue; }

      userlist.append('<div id="' + username + '" class="chuser">' +
                        '<span class="chusername">' + username +
                        '</span></div>');
    }
  };

  /* Receive a message */
  now.receiveMessage = function(name, message){
    var chatlog = $('#chat-log'),
        scrollHeight;

    chatlog.append("<br>" + name + ": " + message);
    scrollHeight = chatlog.attr("scrollHeight");
    chatlog.attr("scrollTop", scrollHeight);
  };

  /* Play a song at a position */
  now.playAt = function(id, pos) {
    var bound = false;

    function play() {
      player.play(id, pos);
      if (bound) {
        listener.unbind('ready', play);
        bound = false;
      }
    }

    if (listener.isReady()) {
      play();
    } else {
      listener.bind('ready', play);
      bound = true;
    }
  };

  now.pause = function() {
  };
});

