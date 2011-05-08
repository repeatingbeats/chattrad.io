$(document).ready(function(){

  /* jhawk this will be included in some fashion later
  setInterval(function() {
    var status = this.getStatus();
    now.updateStatus(status);
  }, 1000);
  */

  $("#join-button").click(function(){
    var roomName = $("#channel-input").val();
    if (!roomName || roomName.length < 1) {
      roomName = "default-room";
    }
    now.join(roomName);
  });

  $("#send-button").click(function(){
    var msg = $("#message").val();
    if (!msg || msg.length < 1) {
      return;
    }
    now.distributeMessage(msg);
    $("#message").val("");
  });


  getStatus = function() {
    return now.STATUS.PLAYING;
  }

  now.name = prompt("What's your name?", "");

  now.receiveMessage = function(name, message){
    $("#chat-log").append("<br>" + name + ": " + message);
  }

  now.echo = function(str) {
    alert(str);
  }

});
