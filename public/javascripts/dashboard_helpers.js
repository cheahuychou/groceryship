var countNotifs = function() {
    return $('.notification-tile').size();
};

var countRequests = function() {
    return $('.request-tile').size();
};

var countDeliveries = function() {
    return $('.delivery-item-row').size();
};

var refreshNotifsCount = function() {
    var count = countNotifs();
    // uncomment if you don't want 0 to display as a count
    count = count === 0 ? '' : count;
    $('.notifs-count').text(count);
};

var refreshRequestsCount = function() {
    var count = countRequests();
    // uncomment if you don't want 0 to display as a count
    count = count === 0 ? '' : count;
    $('.requests-count').text(count);
};

var refreshDeliveriesCount = function() {
    var count = countDeliveries();
    // uncomment if you don't want 0 to display as a count
    count = count === 0 ? '' : count;
    $('.deliveries-count').text(count);
};

var refreshAllCounts = function() {
    refreshNotifsCount();
    refreshRequestsCount();
    refreshDeliveriesCount();
};