// Author: Czarina Lao
$(document).ready(function () {
    $('#filter-sort').click(function() {
        var stores = $('#filter-stores').val();
        var pickupLocations = $('#filter-pickup-location').val();
        var minRating = $('#filter-rating').val();
        if (minRating === "Any") {
            minRating = 1;
        }
        var sortBy = $('#sort-by').val();
        var sortIncreasing = $("#sort-direction input[type='radio']:checked").val();
        var input = {stores: stores, pickupLocations: pickupLocations, minRating: minRating, sortBy: sortBy, sortIncreasing: sortIncreasing};
        window.location.replace("/deliveries/requests?" + $.param(input));
    });

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
                } else {
                    console.log(data.message);
                    addMessage('The request could not be claimed. It might have already been claimed by another user or canceled by the requester.', 'danger', false, true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });
    });
});
