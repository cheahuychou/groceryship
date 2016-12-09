// Author: Czarina Lao

$(document).ready(function () {
    var deliveriesDatatable = $('#deliveries-table').DataTable({
        'order': [],
        'bPaginate': false,
        'bInfo': false,
        'columnDefs': [{ 'orderable': false, 'targets': [0, 1, 2, 3, 4, 7, 8] },
                       { 'orderData':[11], 'targets': [5] }, //sort deadline by raw deadline
                       { 'orderData': [12], 'targets': [10] }, //sort pickup time by raw pickup time
                       { 'targets': [11, 12], 'visible': false, 'searchable': false}]
    });
    deliveriesDatatable.on('draw', function() {
        checkIfNoMatches();
    });

    $('#navbar-dashboard').addClass('active');
    refreshAllCounts();

    // by default empty message is hidden to remove logic from hbs
    checkIfNoNotifs();
    checkIfNoDeliveries();

    // delete all modal messages when modal gets closed
    $('.modal').on('hidden.bs.modal', function() {
        $('.modal-messages').empty();
    });

    // remove all added items on set pickup time modal
    $('#set-pickup-modal').on('hidden.bs.modal', function() {
        $('#set-pickup-modal tbody').empty();
    });

    // stop modal from opening when clicking on a link on a tile
    $('.tile a').click(function(e) {
        e.stopPropagation();
    });

    // toggle the glyphicon chevron icon and count depending on whether toggle is open or not
    // if open, icon should point down, count is not seen
    // if closed, icon should point right, count is seen
    $('.title-toggle').click(function() {
        var icon = $(this).find('.glyphicon');
        var count = $(this).find('.badge');
        if (icon.hasClass('glyphicon-chevron-right')) {
            icon.removeClass('glyphicon-chevron-right');
            icon.addClass('glyphicon-chevron-down');
            count.addClass('hide');
        } else {
            icon.removeClass('glyphicon-chevron-down');
            icon.addClass('glyphicon-chevron-right');
            count.removeClass('hide');
        }
    });

    var csrf = $('#csrf').val();

    $('.cancel-request').click(function(e) {
        var id = $(this).parent().attr('data-id');
        $.ajax({
            url: '/deliveries/'+id,
            type: 'DELETE',
            data: {_csrf: csrf},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    $('.request-tile[data-id='+id+']').parent().remove();
                    refreshAllCounts();
                    // TODO: ask for the reason of cancellation?
                    addMessage('Request canceled.', 'success', false, true);
                } else {
                    console.log(data.message);
                    addMessage('The request could not be canceled. Note that you can\'t cancel claimed requests.', 'danger', false, true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', false, true);
            }
        });

        // stop propagation so that the modal with item details won't open
        e.stopPropagation();
    });

    $('.add-request-tile').click(function() {
        var requestUrl = $('#navbar-request > a').attr('href');
        window.location.replace(requestUrl);
    });

    // make it more usable by allowing checking/unchecking of checkbox by clicking the row
    $('.delivery-item-row').click(function(e) {
        // only do this if the main target wasn't a checkbox
        // because otherwise, the checkbox get double checked/unchecked like nothing happened
        if (!$(e.target).hasClass('deliveries-checkbox')) {
            var rowCheckbox = $(this).children('.checkbox-cell').children('input');
            // toggle row checkbox
            rowCheckbox.prop('checked', !rowCheckbox.prop('checked'));
        }

        // disable set pickup time button if no checkboxes are checked
        if ($('.deliveries-checkbox:checked').size() === 0) {
            $('#deliver-items').prop('disabled', true);
            $('.header-checkbox').prop('checked', false);
        } else {
            $('#deliver-items').prop('disabled', false);
        }

        // uncheck header checkbox if not all items are selected anymore
        if ($('.deliveries-checkbox:checked').size() != $('.deliveries-checkbox').size()) {
            $('.header-checkbox').prop('checked', false);
        // else they're equal meaning all possible checkboxes are checked
        // check the header checkbox if there are boxes checked
        } else if ($('.deliveries-checkbox').size() > 0) {
            $('.header-checkbox').prop('checked', true);
        }
    });

    // checking and unchecking the header checkbox checks/unchecks all the checkboxes
    $('.header-checkbox').change(function() {
        if (this.checked) {
            $('.checkbox-cell input').prop('checked', true);
            $('#deliver-items').prop('disabled', false);
        } else {
            $('.checkbox-cell input').prop('checked', false);
            $('#deliver-items').prop('disabled', true);
        }
    });

    // header checkbox is disabled if no rows have checkboxes
    if ($('.deliveries-checkbox').length === 0) {
        $('.header-checkbox').prop('disabled', true);
    }

    // add selected items to deliver now modal
    $('#deliver-items').click(function() {
        $('.checkbox-cell input').each(function() {
            if (this.checked) {
                var originalRow = $(this).parent().parent();
                var id = originalRow.attr('data-id');
                var row = $('<tr>', {
                    class: 'to-deliver-item',
                    'data-id': id
                });

                // also copy the <a href> for the requester contact info tooltip
                var requester = originalRow.children('.requester').html();
                var itemName = originalRow.children('.item-name').text();
                var pickupPoint = originalRow.children('.pickup-location').text();
                var deadline = originalRow.children('.deadline').text();
                var rawDeadline = new Date(parseInt(originalRow.children('.deadline').children('[name=raw-deadline]').val()));

                var inputPickupTime = $('<input>', {
                    class: 'form-control flatpickr',
                    type: 'text',
                    name: 'pickup-time',
                    'data-deadline': rawDeadline
                });
                // TODO: make a listener on .change to do static checking of date
                // flatpickr only supports min and max date but not time

                var inputPrice = $('<input>', {
                    class: 'price form-control',
                    type: 'String',
                    name: 'price'
                }).change(function() {
                    showPriceFormatErrors(this, false);
                });


                row.append($('<td>', {html: requester}));
                row.append($('<td>', {class: 'set-pickup-item', text: itemName}));
                row.append($('<td>', {text: pickupPoint}));
                row.append($('<td/>').append(inputPickupTime));
                row.append($('<td/>').append(inputPrice));

                $('#set-pickup-modal tbody').append(row);
                console.log(rawDeadline);
                // initialize flatpickr with restrictions based on time now and deadline
                flatpickr('tr[data-id="'+id+'"] .flatpickr[name=pickup-time]', {
                    enableTime: true,
                    // minDate: 'today',
                    enable: [{from: 'today', to: rawDeadline}],
                    // create an extra input solely for display purposes
                    altInput: true,
                    altFormat: "M j Y, h:i K"
                });
            }
        });

        // initialize all tooltips in modal
        $('#set-pickup-modal [data-toggle=tooltip]').tooltip({
            title: getContactTooltip,
            container: 'body',
            placement: 'bottom',
            html: true
        });
    });

    // clear modal rows on close
    $('#set-pickup-modal').on('hidden.bs.modal', function () {
        // assign to a variable first because if no flatpickrs exist,
        // flatpickrs.destroy() will throw an error
        var flatpickrs = flatpickr('#set-pickup-modal .flatpickr[name=pickup-time]');
        if (flatpickrs.length !== 0) {
            flatpickrs.destroy();
        }
        $('#set-pickup-modal tbody').empty();
    });

    $('#deliver-confirm-button').click(function() {
        var hasError = false;
        // validate inputs first
        $('#set-pickup-modal input').each(function() {
            // check that all inputs are nonempty
            // if empty, alert the user of the error and show where it is
            if (!$(this).val() || $(this).val().trim()=='') {
                if (!$(this).parent().hasClass('has-error')) {
                    $(this).parent().addClass('has-error');
                }
                hasError = true;
                console.log(this);
                addMessage('All fields must be filled out.', 'danger', true, true);
                return false;
            } else if ($(this).hasClass('price')
                && $(this).parent().hasClass('has-error')) {
                // check if valid prices are entered
                hasError = true;
                addMessage('Please enter a valid price.', 'danger', true, true);
                return false;
            } else {
                $(this).parent().removeClass('has-error');
            }

            if ($(this).attr('name') == 'pickup-time') {                
                // check if pickup time is in the future and <= deadline
                // TODO: attach this validator to .change of datetime pickers instead
                var pickupTime = new Date($(this).val()+getFormattedTimezoneOffset());
                if (pickupTime < Date.now() || pickupTime > new Date($(this).attr('data-deadline'))) {
                    if (!$(this).parent().hasClass('has-error')) {
                        $(this).parent().addClass('has-error');
                    }
                    hasError = true;
                    addMessage('Please enter a date and time in the future and before the deadline.', 'danger', true, true);
                    return false;
                } else {
                    $(this).parent().removeClass('has-error');
                }
            }
        });

        if (!hasError) {
            var deliveredItems = $('.to-deliver-item').map(function() {
                var currentItem = $(this);
                var id = $(this).attr('data-id');
                var pickupTime = $(this).find('input[name=pickup-time]').val();
                var price = $(this).find('input[name=price]').val();

                var pickupTimeWithTimezone = new Date(pickupTime+getFormattedTimezoneOffset());
                return $.ajax({
                    url: '/deliveries/'+id+'/deliver',
                    type: 'PUT',
                    data: {
                        pickupTime: pickupTimeWithTimezone,
                        actualPrice: price,
                        _csrf: csrf
                    },
                    success: function(data) {
                        // TODO
                        if (data.success) {
                            // update to deliver table
                            var originalRow = $('.delivery-item-row[data-id='+id+']');
                            // remove checkbox because pickup time has been set
                            originalRow.children('.checkbox-cell').empty();
                            // update pickup time
                            originalRow.children('.pickup-time').text(moment(pickupTimeWithTimezone).format('MMM D, h:mm A'));
                            deliveriesDatatable.cell('.delivery-item-row[data-id='+id+']', 12).data(pickupTimeWithTimezone.getTime());
                            // remove item and associated flatpickr from modal
                            flatpickr('tr[data-id="'+id+'"] .flatpickr[name=pickup-time]').destroy();

                            // remove item from modal
                            currentItem.remove();
                        } else {
                            hasError = true;
                            console.log(data.message);
                        }
                    },
                    error: function(err) {
                        console.log(err);
                        // TODO: tell user which ones failed?
                        hasError = true;
                    }
                });
            });

            $.when.apply(this, deliveredItems).then(function() {
                // header checkbox is disabled if no rows have checkboxes
                if ($('.deliveries-checkbox').length === 0) {
                    $('.header-checkbox').prop('disabled', true);
                    $('#deliver-items').prop('disabled', true);
                } else if ($('.deliveries-checkbox:checked').size() === 0) {
                    // disable deliver now button if no checkboxes are checked
                    $('#deliver-items').prop('disabled', true);
                    $('.header-checkbox').prop('checked', false);
                }

                if (hasError) {
                    addMessage('The request to deliver some items failed. Please try again. Make sure that the pickup time is before the deadline!', 'danger', true, true);
                } else {
                    addMessage('The requester/s have been notified. Make sure to promptly deliver the items with the receipt at the set pickup time!', 'success', false, true);
                    addMessage('Sending your delivery item to your notifications...', 'success', false, false);
                    // only close the modal if all items were successfully updated
                    $('#set-pickup-modal').modal('toggle');
                    // refresh to get new notifications from newly set pickup times
                    // make refresh wait for a while so that user can read the success messages
                    setTimeout(function(){
                        window.location.reload(true);
                    }, 2000);   
                }
            });
        }
    });
});
