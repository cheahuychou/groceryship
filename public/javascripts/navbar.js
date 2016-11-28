// Author: Czarina Lao
$(document).ready(function() {
    $('.logout-button').click(function() {
        $.post('/logout', {}, function() {
            window.location.replace('/');
        });
    });
});