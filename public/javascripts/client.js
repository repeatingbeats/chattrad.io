$(document).ready(function(){

  setInterval(function() {
    var status = this.getStatus();
    now.updateStatus(status);
  }, 1000);

  getStatus = function() {
    return now.STATUS.PLAYING;
  }

  now.name = prompt("What's your name?", "");

  now.receiveMessage = function(name, message){
    $("#messages").append("<br>" + name + ": " + message);
  }

  now.echo = function(str) {
    alert(str);
  }

});
