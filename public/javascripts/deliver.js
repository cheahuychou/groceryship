// Author: Czarina Lao
// js for the Deliver tab page

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
        var noRequestsMessage = $('<div>', {
            class: 'well well-lg message no-requests-message',
            text: 'No requests from other users to claim yet.'
        });
        
        $('#request-table').after(noRequestsMessage);
    }
}

/**
 * Adds the click handler to all the claim buttons for requests
 * in requestTable if it does not already exist.
 * @param  {Object} requestTable a DataTable instance
 */
var initializeClaimButtons = function(requestTable) {
    // remove any previously set click functions before redefining it again
    $('.claim-request').prop('onclick',null).off('click').click(function() {
        var id = $(this).parent().parent().attr('data-id');
        var csrf = $('#csrf').val();
        $.ajax({
            url: '/deliveries/'+id+'/claim',
            type: 'PUT',
            data: {id: id, _csrf: csrf},
            success: function(data) {
                if (data.success) {
                    requestTable.row($('.request-item-row[data-id='+id+']')).remove().draw(false); //draw(false) tells datatables to remain on current page after removing
                    addMessage('Request claimed! It has been added to your dashboard. Remember to contact the requester to set a pickup time.', 'success', false, true);

                    //if there are no request data left, display "No request to claim" message
                    if (requestTable.data().count() === 0) {
                        checkIfNoRequests();
                    }
                } else {
                    addMessage('The request could not be claimed. It might have already been claimed by another user or canceled by the requester.', 'danger', false, true);
                }
            },
            error: function(err) {
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });
    });
}


$(document).ready(function () {
    // initialize table for request feed
    var requestTable = $('#request-table').DataTable({
        "ordering": false,
    });
    requestTable.on('draw', function() {
        fixPaginationButtons();
        initializeClaimButtons(requestTable);
        $('[data-toggle="tooltip"]').tooltip({
            title: getContactTooltip,
            container: 'body',
            placement: 'bottom',
            html: true
        });

        // display "No matches found" if there are no matches & table has data
        if ($('.request-item-row').size() === 0 && requestTable.data().count() !== 0) {
            // fixes small issue when there are no matches and tooltip remains shown
            $('.tooltip').hide();
            var noMatchesMessage = $('<div>', {
                class: 'well well-lg no-matches-message',
                text: 'No matches found.'
            });
            // show no matches message if not already shown
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

    initializeClaimButtons(requestTable);
});
