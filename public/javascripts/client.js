$(document).ready(function(){

  /* Inform the server of our position in the song periodically */
  var songPlaying = false;
  setInterval(function() {
    if (songPlaying) { // jhawk temp hack
      var pos = this.getPosition();
      now.updatePosition(pos);
    }
  }, 5000);

  /* Join a room */
  $("#join-button").click(function(){
    var roomName = $("#channel-input").val();
    if (!roomName || roomName.length < 1) {
      roomName = "default-room";
    }
    now.join(roomName);
    songPlaying = true;
  });

  /* Send a message */
  $("#message").keydown(function(e){
    var code = (e.keyCode) ? e.keyCode : e.which,
        msg = $("#message").val();

    if (!msg || msg.length < 1 || code !== 13) {
      return;
    }

    now.distributeMessage(msg);
    $("#message").val("");
  });

  // jhawk temporary position tracking
  var counter = 0;
  getPosition = function() {
    return ++counter;
  }

  // jhawk temporary force the user to give us a name, use Rdio username
  //now.name = prompt("What's your name?", "");

  /* Receive a message */
  now.receiveMessage = function(name, message){
    $("#chat-log").append("<br>" + name + ": " + message);
  }

  /* Play a song at a position */
  now.playAt = function(id, pos){
    if (pos == -1) {
      alert("playing from the start");
    }
    else {
      alert("playing from " + pos);
    }
  }

  now.pause = function() {

  }

});
