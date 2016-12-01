// Author: Cheahuychou Mao
$(document).ready(function () {
    var csrf = $('#csrf').val();
    // TODO: clear messages in .modal-messages when modal is closed
    
    $('.reject-rate-button').click(function() {
        var id = $(this).parent().parent().parent().parent().attr('id').split('-')[2];
        var reason = $('#reason :selected').val();
        var rating = $(this).parent().find('.fa-star').length;
        $.ajax({
            url: '/deliveries/'+id+'/reject',
            type: 'PUT',
            data: {id: id, reason: reason, shopperRating: rating, _csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    // TODO (or not?): change isModal argument to false and close the modal here
                    addMessage('Rejection succeeded. The shopper has been notified.', 'success', true, true);
                } else {
                    console.log(data.message);
                    addMessage('Rejection failed. Please try again.', 'danger', true, true);
                }
                $('#reject-modal-' + id).modal('toggle');
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
            }
        });
    });

	$('.deliver-rate-button').click(function() {
        var id = $(this).parent().parent().parent().parent().attr('id').split('-')[2];
        var rating = $(this).parent().find('.fa-star').length;
        $.ajax({
            url: '/deliveries/'+id+'/rateRequester',
            type: 'PUT',
            data: {id: id, requesterRating: rating, _csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    // TODO (or not?): change isModal argument to false and close the modal here
                    addMessage('Rating succeeded.', 'success', true, true);
                } else {
                    console.log(data.message);
                    addMessage('Rating failed. Please try again.', 'danger', true, true);
                }
                $('#close-modal-' + id).modal('toggle');
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
            }
        });
    });
});