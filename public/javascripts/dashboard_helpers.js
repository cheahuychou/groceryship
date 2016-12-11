// Author: Czarina Lao
/**
 * Checks if there are no notifications on display.
 * If there are none, displays the no notifications message.
 * @return {void}
 */
var checkIfNoNotifs = function() {
    if ($('.notification-tile').size() === 0) {
        $('.no-notif-message').removeClass('hide');
    }
};

/**
 * Checks if there are no deliveries on display in To Deliver.
 * If there are none, displays the empty delivery table message.
 * @return {void}
 */
var checkIfNoDeliveries = function() {
    // check if table is empty; if it is, show empty message
    // and disable button and header checkbox
    if ($('.delivery-item-row').size() === 0) {
        $('.empty-delivery-table').removeClass('hide');
        $('.header-checkbox').prop('disabled', true);
        $('#deliver-items').prop('disabled', true);
    }
};

/**
 * Checks if there are no deliveries on display in To Deliver
 * because there were no matches in the search.
 * If there are none, displays the no matches message
 * and appropriately updates other components
 * such as disabling/enabling checkboxes and the Set Pickup Time button.
 * @return {void}
 */
var checkIfNoMatches = function() {    
    if ($('.deliveries-checkbox').length === 0) {
        // header checkbox is disabled if no rows have checkboxes
        $('.header-checkbox').prop('disabled', true);
    } else {
        $('.header-checkbox').prop('disabled', false);
    }

    if ($('.delivery-item-row').size() === 0) {
        var noMatchesMessage = $('<div>', {
            class: 'well well-lg no-matches-message',
            text: 'No matches found.'
        });
        
        if ($('.no-matches-message').size() === 0) {
            $('#deliveries-table').after(noMatchesMessage);
        }
        
        $('#deliver-items').prop('disabled', true);
        // fixes small issue that tooltip remains shown when there are no matches
        $('.tooltip').hide();
    } else {
        $('.no-matches-message').remove();
    }
}

/**
 * Counts the number of notifications in the DOM
 * @return {Integer} the number of notifications in the DOM
 */
var countNotifs = function() {
    return $('.notification-tile').size();
};

/**
 * Counts the number of requests in the DOM
 * @return {Integer} the number of requests in the DOM
 */
var countRequests = function() {
    return $('.request-tile').size();
};

/**
 * Counts the number of deliveries in the DOM
 * @return {Integer} the number of deliveries in the DOM
 */
var countDeliveries = function() {
    return $('.delivery-item-row').size();
};

/**
 * Updates the displayed count for the number of notifications
 */
var refreshNotifsCount = function() {
    var count = countNotifs();
    // comment line below if you want 0 to display as a count
    count = count === 0 ? '' : count;
    $('.notifs-count').text(count);
};

/**
 * Updates the displayed count for the number of requests
 */
var refreshRequestsCount = function() {
    var count = countRequests();
    // comment line below if you want 0 to display as a count
    count = count === 0 ? '' : count;
    $('.requests-count').text(count);
};

/**
 * Updates the displayed count for the number of deliveries
 */
var refreshDeliveriesCount = function() {
    var count = countDeliveries();
    // comment line below if you want 0 to display as a count
    count = count === 0 ? '' : count;
    $('.deliveries-count').text(count);
};

/**
 * Updates all the displayed counts of the components on the dashboard:
 * notifications, requests, and deliveries
 */
var refreshAllCounts = function() {
    refreshNotifsCount();
    refreshRequestsCount();
    refreshDeliveriesCount();
};
