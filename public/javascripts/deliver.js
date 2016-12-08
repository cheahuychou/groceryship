// Author: Czarina Lao

/**
 * Makes the pagination buttons use Flat UI styling
 * instead of the default provided by datatables.js,
 * which is not responsive.
 */
var fixPaginationButtons = function () {
    $('li.previous').children().addClass('fui-arrow-left').text('');
    $('li.next').children().addClass('fui-arrow-right').text('');
};

/**
 * Checks if there are no requests in the table.
 * If there are none, shows the no requests message
 * @return {void} 
 */
var checkIfNoRequests = function () {
    if ($('.request-item-row').size() === 0) {
        // not using this anymore for now because of the weird formatting
        // with the new integration with datatable
        // $('.empty-requests-table-message').removeClass('hide');
        var noRequestsMessage = $('<div>', {
            class: 'well well-lg message no-requests-message',
            text: 'No requests from other users to claim yet.'
        });
        
        $('#request-table').after(noRequestsMessage);
    }
}

var initializeClaimButtons = function() {
    $('.claim-request').click(function() {
        var id = $(this).parent().parent().attr('data-id');
        var csrf = $('#csrf').val();
        $.ajax({
            url: '/deliveries/'+id+'/claim',
            type: 'PUT',
            data: {id: id, _csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    $('.request-item-row[data-id='+id+']').remove();
                    addMessage('Request claimed! It has been added to your dashboard. Remember to contact the requester to set a pickup time.', 'success', false, true);
                    checkIfNoRequests();
                } else {
                    addMessage('The request could not be claimed. It might have already been claimed by another user or canceled by the requester.', 'danger', false, true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });
    });
}


$(document).ready(function () {
    $('#request-table').DataTable({
        //"order": [],
        "ordering": false
    }).on('draw', function() {
        fixPaginationButtons();
        initializeClaimButtons();
        $('[data-toggle="tooltip"]').tooltip({
            title: getContactTooltip,
            container: 'body',
            placement: 'bottom',
            html: true
        });
        if ($('.request-item-row').size() === 0) {
            // fixes small issue when there are now matches and tooltip remains shown
            $('.tooltip').hide();
            var noMatchesMessage = $('<div>', {
                class: 'well well-lg no-matches-message',
                text: 'No matches found.'
            });
            // don't show no matches message if the table was empty to begin with (marked by no requests to claim message)
            if ($('.no-matches-message, .message').size() === 0) {
                $('#request-table').after(noMatchesMessage);
            }
        } else {
            $('.no-matches-message').remove();
        }
    });

    fixPaginationButtons();

    $('#navbar-deliver').addClass('active');
    checkIfNoRequests();

    $('#filter-sort').click(function() {
        var stores = $('#filter-stores').val();
        var pickupLocations = $('#filter-pickup-location').val();
        var minRating = $('#filter-rating').val();
        if (minRating === "No minimum requester rating") {
            minRating = 1;
        }
        var sortBy = $('#sort-by').val();
        var sortIncreasing = $("#sort-direction input[type='radio']:checked").val();
        var input = {stores: stores, pickupLocations: pickupLocations, minRating: minRating, sortBy: sortBy, sortIncreasing: sortIncreasing};
        window.location.replace("/deliveries/?" + $.param(input));
    });

    initializeClaimButtons();
});
