// Author: Cheahuychou Mao
$(document).ready(function () {
    $('.reject-rate-button').click(function() {
        var id = $(this).parent().parent().parent().parent().attr('id').split('-')[2];
        var reason = $('#reason :selected').val();
        var rating = $(this).parent().find('.fa-star').length;
        $.ajax({
            url: '/deliveries/'+id+'/reject',
            type: 'PUT',
            data: {id: id, reason: reason, shopperRating: rating},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    addMessage('Rejection succeeded. The shopper has been notified.', 'success', true);
                } else {
                    console.log(data.message);
                    addMessage('Rejection failed. Please try again.', 'danger', true);
                }
                $('#reject-modal-' + id).modal('toggle');
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
                $('#reject-modal-' + id).modal('toggle');
            }
        });
    });

	$('.deliver-rate-button').click(function() {
        var id = $(this).parent().parent().parent().parent().attr('id').split('-')[2];
        console.log('id', id);
        var rating = $(this).parent().find('.fa-star').length;
        console.log('hiiii', rating);
        $.ajax({
            url: '/deliveries/'+id+'/rateRequester',
            type: 'PUT',
            data: {id: id, requesterRating: rating},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    addMessage('Rating succeeded.', 'success', true);
                } else {
                    console.log(data.message);
                    addMessage('Rating failed. Please try again.', 'danger', true);
                }
                $('#close-modal-' + id).modal('toggle');
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
                $('#close-modal-' + id).modal('toggle');
            }
        });
    });
});