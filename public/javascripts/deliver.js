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


var initializeClaimButtons = function(requestTable) {
    $('.claim-request').prop('onclick',null).off('click').click(function() { //this removes any previously set click functions before redefining it again
        var id = $(this).parent().parent().attr('data-id');
        var csrf = $('#csrf').val();
        $.ajax({
            url: '/deliveries/'+id+'/claim',
            type: 'PUT',
            data: {id: id, _csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    requestTable.row($('.request-item-row[data-id='+id+']')).remove().draw(false); //draw(false) tells datatables to remain on current page after removing
                    addMessage('Request claimed! It has been added to your dashboard. Remember to contact the requester to set a pickup time.', 'success', false, true);
                    if (requestTable.data().count() === 0) { //if there are no request data left, display "No request to claim" message
                        checkIfNoRequests();
                    }
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
    var requestTable = $('#request-table').DataTable({
        "ordering": false,
        "language": {"emptyTable": "No requests from other users to claim yet."}
    });
    requestTable.on('draw', function() {
        console.log('drawing~');
        fixPaginationButtons();
        initializeClaimButtons(requestTable);
        $('[data-toggle="tooltip"]').tooltip({
            title: getContactTooltip,
            container: 'body',
            placement: 'bottom',
            html: true
        });

        if ($('.request-item-row').size() === 0 && requestTable.data().count() !== 0) { //display "No matches found" if there are no matches & table has data
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
