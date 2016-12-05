// Author: Cheahuychou Mao
$(document).ready(function () {
    var csrf = $('#csrf').val();
    $('.accept-modal').on('shown.bs.modal', function() {
        $('.card-number').focus();
    });

    $('.reject-modal').on('shown.bs.modal', function() {
        $('.reason').focus();
    });

    $('.close-modal').on('shown.bs.modal', function() {
        $('.deliver-rate-button').focus();
    });

    $('.notfication-tile').click(function(e) {
        // don't open the modal if the direct click target is a button or a link
        if ($(e.target).hasClass('btn') || $(e.target).attr('href')) {
            e.preventDefault();
        } else {
            var id = $(this).attr('data-id');
            $('#notification-modal-'+id).modal('toggle');
        }
    });


    $('.close-expired-notif').click(function() {
        var id = $(this).attr('data-id');
        $('#notif-container-' + id).remove();
        $.ajax({
            url: '/deliveries/'+id+'/seeExpired',
            type: 'PUT',
            data: {_csrf: csrf},
            success: function(data) {}, //do nothing
            error: function(err) {console.log(err);}
        });
    });
    
    $('.pay-rate-button').click(function() {
        var id = $(this).attr('data-id');
        var cardNumber = $('#card-number-'+id).val();
        var expMonth = $('#expiry-month-'+id).val();
        var expYear = $('#expiry-year-'+id).val();
        var cvc = $('#cvc-'+id).val();
        var rating = $('#rating-container-'+id).find('.fa-star').length;
        console.log(id, rating, cardNumber, expMonth, expYear, cvc);
        $.ajax({
            url: '/deliveries/'+id+'/accept',
            type: 'PUT',
            data: {
                    id: id, 
                    shopperRating: rating, 
                    _csrf: csrf, 
                    cardNumber: cardNumber,
                    expMonth: expMonth,
                    expYear: expYear,
                    cvc: cvc
                },
            success: function(data) {
                console.log(data);
                if (data.success) {
                    addMessage('Payment succeeded. The shopper has been notified.', 'success', false, true);
                    $('#accept-modal-' + id).modal('toggle');
                    $('#notif-container-' + id).remove();
                    // TODO: update the average rating of the user being rated in the UI as well
                    // TODO: if it's the last notification, show no notifications message
                } else {
                    console.log(data.message);
                    addMessage(data.message + " Please try again.", 'danger', true, true);
                    $('.card-number').focus();
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
            }
        });
    });

    $('.reject-rate-button').click(function() {
        var id = $(this).attr('data-id');
        var reason = $('#reason-'+id+' :selected').val();
        var rating = $('#rating-container-'+id).find('.fa-star').length;
        $.ajax({
            url: '/deliveries/'+id+'/reject',
            type: 'PUT',
            data: {id: id, reason: reason, shopperRating: rating, _csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    addMessage('Rejection succeeded. The shopper has been notified.', 'success', false, true);
                    $('#reject-modal-' + id).modal('toggle');
                    $('#notif-container-' + id).remove();
                    // TODO: update the average rating of the user being rated in the UI as well
                    // TODO: if it's the last notification, show no notifications message
                } else {
                    console.log(data.message);
                    addMessage('Rejection failed. Please try again.', 'danger', true, true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
            }
        });
    });

	$('.deliver-rate-button').click(function() {
        var id = $(this).attr('data-id');
        var rating = $('#rating-container-'+id).find('.fa-star').length;
        $.ajax({
            url: '/deliveries/'+id+'/rateRequester',
            type: 'PUT',
            data: {id: id, requesterRating: rating, _csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    addMessage('Rating succeeded.', 'success', false, true);
                    $('#close-modal-' + id).modal('toggle');
                    $('#notif-container-' + id).remove();
                    // TODO: update the average rating of the user being rated in the UI as well
                    // TODO: if it's the last notification, show no notifications message
                } else {
                    console.log(data.message);
                    addMessage('Rating failed. Please try again.', 'danger', true, true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
            }
        });
    });
});
