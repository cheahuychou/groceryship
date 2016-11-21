$(document).ready(function () {
	var username = $('.username').text();
	$.get('/deliveries/' + username, function(data) {
	    if (!data.success) {
	     	alert('Unable to load your requests and items to deliver');
	      	return false;
	    }
  	});
})