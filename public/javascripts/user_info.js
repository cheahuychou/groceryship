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
            $(targetElement + ' .shipping-rating').prop('hidden', true);
            $(targetElement + ' .request-rating').prop('hidden', false);
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
            text: 'Rating: ' + rating.toFixed(2) + ' out of ' + NUM_STARS.toFixed(2)
        }));
    });
};

/**
 * Creates the jQuery object for the star ratin
 * @param  {Integer} rating the rating for hte star rating     
 * @return {Object}         the jQuery object for the star rating      
 */        
var createStarRating = function(rating) {      
    return $('<div>', {        
        class: 'star-rating',      
        text: rating       
    });        
};     
       
/**        
 * Updates the star rating displayed on the tooltip for the user with id userId.       
 * @param  {String}  userId     the id of the user     
 * @param  {Integer}  newRating        
 * @param  {Boolean} isShipping true if newRating is the new shipping rating; false if it's for the new request rating     
 * @return {void}                  
 */        
var updateStarRating = function(userId, newRating, isShipping) {       
    var starRatingDiv = createStarRating(newRating);       
    var ratingTypeSelector = isShipping ? '.shipping-rating' : '.request-rating';      
    var userRatingSelector = '.contact-tooltip-'+userId;       
       
    $(userRatingSelector+' '+ratingTypeSelector).empty().append(starRatingDiv);        
    fillStars(userRatingSelector+' .star-rating', true);       
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
