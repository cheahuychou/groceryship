$(document).ready(function () {
	var username = $('.username').text();
	$.get('/deliveries/' + username, function(data) {
  	});
})