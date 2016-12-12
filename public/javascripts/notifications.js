// Author: Cheahuychou Mao

$(document).ready(function () {
    var csrf = $('#csrf').val();

    // focus on first input box on modals      
    $('.accept-modal').on('shown.bs.modal', function() {       
        $('.card-number').focus();     
    });        
       
    $('.reject-modal').on('shown.bs.modal', function() {       
        $('.reason').focus();      
    });        
       
    $('.close-modal').on('shown.bs.modal', function() {        
        $('.deliver-rate-button').focus();     
    });

    $('.notification-tile').click(function(e) {
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
            success: function(data) {
                refreshAllCounts();
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });
    });
    
    $('.pay-rate-button').click(function() {
        var id = $(this).attr('data-id');
        var hasError = false;
        // TODO: add more validation to inputs
        // e.g. expiry is this month,year or later
        $('#accept-modal-'+id+' input').each(function() {
            if ($(this).attr('required') && (!$(this).val() || $(this).val().trim()=='')) {
                showError(this);
                hasError = true;
            } else {
                $(this).parent().removeClass('has-error');
            }
        });

        if (hasError) {
            addMessage('All fields are required.', 'danger', true, true);
        } else {
            var cardNumber = formatNumberString($('#card-number-'+id).val());
            var expMonth = $('#expiry-month-'+id).val();
            var expYear = $('#expiry-year-'+id).val();
            var cvc = formatNumberString($('#cvc-'+id).val());
            var rating = $('#rating-container-'+id).find('.fa-star').length;

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
                    if (data.success) {
                        addMessage('Payment succeeded. The shopper has been notified.', 'success', false, true);
                        $('#accept-modal-' + id).modal('toggle');

                        $('#notif-container-' + id).remove();
                        checkIfNoNotifs();

                        // remove corresponding request tile and modal if it exists
                        $('#request-tile-container-' + id).remove();
                        $('#request-modal-' + id).remove();

                        refreshAllCounts();

                        // update the average rating of the user being rated in the UI as well
                        var userId = $('#rating-container-'+id).attr('data-user');
                        updateStarRating(userId, data.newRating, true);

                    } else {
                        addMessage(data.message + " Please try again.", 'danger', true, true);
                        $('.card-number').focus();
                    }
                },
                error: function(err) {
                    addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
                }
            });
        }
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
                if (data.success) {
                    addMessage('Rejection succeeded. The shopper has been notified.', 'success', false, true);
                    $('#reject-modal-' + id).modal('toggle');

                    $('#notif-container-' + id).remove();
                    checkIfNoNotifs();

                    // remove corresponding request tile and modal if it exists
                    $('#request-tile-container-' + id).remove();
                    $('#request-modal-' + id).remove();
                    // remove corresponding row in To Deliver table
                    $('.delivery-item-row[data-id='+id+']').remove();
                    checkIfNoDeliveries();
                    
                    // update the average rating of the user being rated in the UI as well
                    var userId = $('#rating-container-'+id).attr('data-user');
                    updateStarRating(userId, data.newRating, true);
                    
                    refreshAllCounts();
                } else {
                    addMessage('Rejection failed. Please try again.', 'danger', true, true);
                }
            },
            error: function(err) {
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
                if (data.success) {
                    addMessage('Rating succeeded.', 'success', false, true);
                    $('#close-modal-' + id).modal('toggle');

                    $('#notif-container-' + id).remove();
                    checkIfNoNotifs();

                    // remove corresponding row in To Deliver table
                    $('.delivery-item-row[data-id='+id+']').remove();
                    checkIfNoDeliveries();

                    // update the average rating of the user being rated in the UI as well
                    var userId = $('#rating-container-'+id).attr('data-user');
                    updateStarRating(userId, data.newRating, false);
                    
                    refreshAllCounts();
                } else {
                    addMessage('Rating failed. Please try again.', 'danger', true, true);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', 'danger', true, true);
            }
        });
    });
});
