$(document).ready(function(){

  now.name = prompt("What's your name?", "");
  now.receiveMessage = function(name, message){
    $("#messages").append("<br>" + name + ": " + message);
  }

});
