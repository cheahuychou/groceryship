// Author: Czarina Lao
$(document).ready(function () {

    // populate notification modal
    $('.view-notification').click(function() {
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type'); //type of notification

        //function to populate notification modal given json response from ajax call
        var populateNotification = function(delivery) {
            if (delivery.itemDescription === null) {
                delivery.itemDescription = 'N/A';
            }

            var row = $('<tr>', {
                class: 'notification-item',
                'data-id': delivery._id
            });
            row.append($('<td>', {text: delivery.itemName}));
            row.append($('<td>', {text: delivery.itemQuantity}));
            row.append($('<td>', {text: delivery.estimatedPrice}));
            row.append($('<td>', {text: delivery.stores}));
            row.append($('<td>', {text: delivery.deadline}));
            row.append($('<td>', {text: delivery.pickupLocation}));
            row.append($('<td>', {text: delivery.tips}));
            row.append($('<td>', {text: delivery.itemDescription}));
            if (type === "delivery") {
                row.append($('<td>', {text: delivery.requester.username}));
            } else {
                row.append($('<td>', {text: delivery.shopper.username}));
            }
            row.append($('<td>', {text: delivery.pickupTime}));
            row.append($('<td>', {text: delivery.actualPrice}));

            $('#notification-modal tbody').append(row); //populates table

            // Changes text based on whether the notification is a delivery or a request
            if (type === "delivery") {
                $('#notification-modal #requester-or-shopper').text("Requester");
                $('#notification-modal #request-or-delivery').text("Delivery");
            } else {
                $('#notification-modal #requester-or-shopper').text("Shopper");
                $('#notification-modal #request-or-delivery').text("Request");
            }
        };

        $.ajax({
            url: '/deliveries/id/'+id,
            type: 'GET',
            success: function(data) {
                if (data.success) {
                    populateNotification(data.delivery[0]);
                } else {
                    console.log(data.message);
                    addMessage('Error fetching information', 'danger', true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
            }
        });
    });

    // clear modal information on close
    $('#notification-modal').on('hidden.bs.modal', function (e) {
        $('#notification-modal .notification-input').each(function() {
            $(this).empty();
        });
    });

    $('.cancel-request').click(function() {
        var id = $(this).parent().parent().attr('data-id');
        $.ajax({
            url: '/deliveries/'+id,
            type: 'DELETE',
            success: function(data) {
                console.log(data);
                if (data.success) {
                    $('.request-item-row[data-id='+id+']').remove();
                    // TODO: ask for the reason of cancellation
                    addMessage('Request canceled.', 'success', true);
                } else {
                    console.log(data.message);
                    addMessage('The request could not be canceled. Note that you can\'t cancel claimed requests.', 'danger', true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
            }
        });
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

        // disable deliver now button if no checkboxes are checked
        if ($('.deliveries-checkbox:checked').size() === 0) {
            $('#deliver-items').prop('disabled', true);
        } else {
            $('#deliver-items').prop('disabled', false);
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
                var row = $('<tr>', {
                    class: 'to-deliver-item',
                    'data-id': originalRow.attr('data-id')
                });

                var requester = originalRow.attr('data-requester');
                var itemName = originalRow.children('.item-name').text();
                var pickupPoint = originalRow.children('.pickup-location').text();
                console.log(originalRow.children('.deadline').text());

                var inputPickupTime = $('<input>', {
                    class: 'form-control',
                    type: 'datetime-local',
                    name: 'pickup-time'
                    // TODO: set min as current datetime
                    // TODO: set max as deadline
                    // and maybe use another better datetime picker
                });

                var inputPrice = $('<input>', {
                    class: 'form-control',
                    type: 'String',
                    name: 'price'
                }).change(function() {
                    showPriceFormatErrors(this);
                });


                row.append($('<td>', {text: requester}));
                row.append($('<td>', {text: itemName}));
                row.append($('<td>', {text: pickupPoint}));
                row.append($('<td/>').append(inputPickupTime));
                row.append($('<td/>').append(inputPrice));

                $('#deliver-now-modal tbody').append(row);
            }
        });
    });

    // clear modal rows on close
    $('#deliver-now-modal').on('hidden.bs.modal', function (e) {
        $('#deliver-now-modal tbody').empty();
    });

    $('#deliver-confirm-button').click(function() {
        var hasError = false;
        // validate inputs first
        $('input').each(function() {
            // check that all inputs are nonempty
            // if empty, alert the user of the error and show where it is
            if (!$(this).val() || $(this).val().trim()=='') {
                if (!$(this).parent().hasClass('has-error')) {
                    $(this).parent().addClass('has-error');
                }
                hasError = true;
                alert('All fields must be filled out.');
                return false;
            } else if ($(this).parent().hasClass('has-error')) {
                $(this).parent().removeClass('has-error');
            }

            // check if pickup time is in the future
            // TODO: the datetimepicker should have datetimes < now disabled
            if ($(this).attr('name') == 'pickup-time') {
                if (new Date($(this).val()) < Date.now()) {
                    if (!$(this).parent().hasClass('has-error')) {
                        $(this).parent().addClass('has-error');
                    }
                    hasError = true;
                    alert('Please enter a date and time after the current date and time.');
                    return false;
                }
            } else if ($(this).attr('name') == 'price') {
                // check if valid prices are entered
                if ($(this).parent().hasClass('has-error')) {
                    hasError = true;
                    alert('Please enter a valid price.');
                    return false;
                }
            }
        });

        if (!hasError) {
            var deliveredItems = $('.to-deliver-item').map(function() {
                var currentItem = $(this);
                var id = $(this).attr('data-id');
                var pickupTime = $(this).find('input[name=pickup-time]').val();
                var price = $(this).find('input[name=price]').val();
                return $.ajax({
                    url: '/deliveries/'+id+'/deliver',
                    type: 'PUT',
                    data: {
                        pickupTime: pickupTime,
                        actualPrice: price
                    },
                    success: function(data) {
                        // TODO
                        if (data.success) {
                            // update to deliver table
                            var originalRow = $('.delivery-item-row[data-id='+id+']');
                            // remove checkbox because pickup time has been set
                            originalRow.children('.checkbox-cell').empty();
                            // update pickup time
                            originalRow.children('.pickup-time').text(data.item.pickupTime);
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
                }
                if (hasError) {
                    alert('The request to deliver some items failed. Please try again. Make sure that the pickup time is before the deadline!');
                } else {
                    alert('The requester/s have been notified. Make sure to promptly deliver the items with the receipt at the set pickup time!');
                    // only close the modal if all items were successfully updated
                    $('#deliver-now-modal').modal('toggle');
                }
            });
        }
    });

});
