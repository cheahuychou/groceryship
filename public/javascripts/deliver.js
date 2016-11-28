// Author: Czarina Lao
$(document).ready(function () {
    $('#filter-sort').click(function() {
        var stores = $('#filter-stores').val();
        var pickupLocations = $('#filter-pickup-location').val();
        var sortBy = $('#sort-by').val();
        var sortIncreasing = $("#sort-direction input[type='radio']:checked").val();
        if (stores === null) {
            stores = ["HMart", "Star Market", "Trader Joe's", "Whole Foods"];
        }
        if (pickupLocations === null) {
            pickupLocations = ['Maseeh', 'McCormick', 'Baker', 'Burton Conner', 'MacGregor', 'New House', 'Next House',
                    'East Campus', 'Senior', 'Random', 'Simmons', 'Lobby 7', 'Lobby 10', 'Stata'];
        }
        if (sortIncreasing !== undefined) {
            sortIncreasing = parseInt(sortIncreasing);
        }
        var input = {stores: stores, pickupLocations: pickupLocations, sortBy: sortBy, sortIncreasing: sortIncreasing};
        window.location.replace("/deliveries/requests?" + $.param(input));
    });

    $('.claim-request').click(function() {
        var id = $(this).parent().parent().attr('data-id');
        $.ajax({
            url: '/deliveries/'+id+'/claim',
            type: 'PUT',
            data: {id: id},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    $('.request-item-row[data-id='+id+']').remove();
                    addMessage('Request claimed! It has been added to your dashboard.', 'success', true);
                } else {
                    console.log(data.message);
                    addMessage('The request could not be claimed. It might have already been claimed by another user or canceled by the requester.', 'danger', true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
            }
        });
    });
});
