// Author: Czarina Lao
// js for showing user information with ratings and tooltips

/**
 * Helper function called by .tooltip
 * which gives the associated tooltip for the element this
 * that calls it.
 * @return {String} the html string for the tooltip of this
 */
var getContactTooltip = function() {
    var targetElement = $(this).attr('data-target');

    return $(targetElement).html();
};

// Adapted from: https://github.com/FortAwesome/Font-Awesome/issues/4147
/**
 * Fills in the stars in the element/s given by selector
 * based on the indicated number of stars from the text in each element.
 * That is, if the text says x, x filled stars will be displayed.
 * @param  {String}  selector  the selector for the element/s that will contain the stars
 *                                and that contains the number of stars to be filled
 * @param  {Boolean} isTooltip whether the selector is for (an) element/s in a tooltip
 */
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
    var viewType = isShipping ? 'shopper' : 'requester';
    var userRatingSelector = '#contact-'+viewType+'-tooltip-'+userId;       
       
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
