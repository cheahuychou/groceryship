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

// Adapted from: https://github.com/FortAwesome/Font-Awesome/issues/4147
var fillStars = function(selector, isTooltip) {
    // need tooltip star size because css does weird things
    // and we can't get the element's proper width when updating ratings
    var TOOLTIP_STAR_SIZE = 13;
    var NUM_STARS = 5;
    $(selector).each(function() {
        var rating = parseFloat($(this).text());
        var starSize = isTooltip ? TOOLTIP_STAR_SIZE : ($(this).width() / NUM_STARS);

        $(this).html($('<span>', {
            width: rating * starSize,
        })).append($('<span>', {
            class: 'sr-only',
            text: 'Rating: ' + rating.toFixed(2) + ' out of ' + NUM_STARS
        }));
    });
};

$(document).ready(function () {
    fillStars('.star-rating.tooltip-stars',true);
    fillStars('.star-rating.profile-stars',false);

    $('[data-toggle="tooltip"]').tooltip({
        title: getContactTooltip,
        container: 'body',
        placement: 'bottom',
        html: true
    });
});
