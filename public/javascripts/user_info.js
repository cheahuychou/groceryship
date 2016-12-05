// Author: Czarina Lao
var getContactTooltip = function() {
    var targetElement = $(this).attr('data-target');

    // only show the relevant rating: either the shipping or the request rating
    var viewType = $(this).attr('data-view');
    switch (viewType) {
        case 'shopper':
            $(targetElement + ' .shipping-rating').prop('hidden', false);
            $(targetElement + ' .request-rating').prop('hidden', true);
            break;
        case 'request-feed':
            $(targetElement + ' .shipping-rating').prop('hidden', false);
            $(targetElement + ' .request-rating').prop('hidden', true);
            $(targetElement + ' .user-phone').prop('hidden', true);
            break;
        case 'requester':
            $(targetElement + ' .shipping-rating').prop('hidden', true);
            $(targetElement + ' .request-rating').prop('hidden', false);
            break;
        default:
            break;
    }

    return $(targetElement).html();
};

$(document).ready(function () { 
    // Adapted from: https://github.com/FortAwesome/Font-Awesome/issues/4147
    var fillStars = function(selector) {
        var NUM_STARS = 5;
        $(selector).each(function(i, e) {
            var rating = parseFloat($(e).text());
            var starSize = ($(e).width() / NUM_STARS);

            $(e).html($('<span>', {
                width: rating * starSize
            }));
        });
    };

    fillStars('.star-rating');

    $('[data-toggle="tooltip"]').tooltip({
        title: getContactTooltip,
        container: 'body',
        placement: 'bottom',
        html: true
    });
});