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
