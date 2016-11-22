$(document).ready(function () {
    $('.cancel-request').click(function() {
        var id = $(this).parent().parent().attr('data-id');
        $.ajax({
            url: '/deliveries/'+id,
            type: 'DELETE',
            success: function(data) {
                console.log(data);
                if (data.success) {
                    $('.request-item-row[data-id='+id+']').remove();
                    // TODO: show message that cancel was successful
                    // TODO: ask for the reason of cancellation
                } else {
                    console.log(data.message);
                    // TODO: show error message
                }
            },
            error: function(err) {
                console.log(err);
                // TODO: show error message
            }
        });
    });

    // make it more usable by allowing checking/unchecking of checkbox by clicking the row
    $('.delivery-item-row').click(function() {
        var rowCheckbox = $(this).children('.checkbox-cell').children('input');
        // toggle row checkbox
        rowCheckbox.prop('checked', !rowCheckbox.prop('checked'));
    });

    // checking and unchecking the header checkbox checks/unchecks all the checkboxes
    $('.header-checkbox').change(function() {
        if (this.checked) {
            $('.checkbox-cell input').prop('checked', true);
        } else {
            $('.checkbox-cell input').prop('checked', false);
        }
    });

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

                var inputPickupTime = $('<input>', {
                    class: 'form-control',
                    type: 'datetime-local',
                    name: 'pickup-time'
                });

                var inputPrice = $('<input>', {
                    class: 'form-control',
                    type: 'String',
                    name: 'price'
                });

                row.append($('<td>', {text: requester}));
                row.append($('<td>', {text: itemName}));
                row.append($('<td>', {text: pickupPoint}));
                row.append($('<td/>').append(inputPickupTime));
                row.append($('<td/>').append(inputPrice));

                $('#deliver-now-modal tbody').append(row);
            }
        });

        $('#deliver-now-modal').find('.modal-content').css({
            width:'auto', //probably not needed
            height:'auto',
            'max-width': '100%'
        });

    });

    // clear modal rows on close
    $('#deliver-now-modal').on('hidden.bs.modal', function (e) {
        $('#deliver-now-modal tbody').empty();
    });

    // TODO: move this to utils so that it can be used in other forms
    var checkPriceFormat = function(priceString) {
        var price = parseFloat(priceString);
        if (isNaN(price)) return false;
        return price;
    };

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

            // check if valid prices are entered
            if ($(this).attr('name') == 'price') {
                var price = checkPriceFormat($(this).val());
                if (price) {
                    $(this).val(price);
                } else {
                    if (!$(this).parent().hasClass('has-error')) {
                        $(this).parent().addClass('has-error');
                    }
                    hasError = true;
                    alert('Please enter a valid price.');
                    return false;
                }
            }
        });

        if (!hasError) {
            $('.to-deliver-item').each(function() {
                var id = $(this).attr('data-id');
                var pickupTime = $(this).find('input[name=pickup-time]').val();
                var price = $(this).find('input[name=price]').val();
                $.ajax({
                    url: '/deliveries/'+id+'/deliver',
                    type: 'PUT',
                    data: {
                        pickupTime: pickupTime,
                        actualPrice: price
                    },
                    success: function(data) {
                        // console.log(data);
                        // TODO
                        var originalRow = $('.delivery-item-row[data-id='+id+']');
                        // remove checkbox because pickup time has been set
                        originalRow.children('.checkbox-cell').empty();
                        // update pickup time
                        // TODO maybe include updated item in data with formatted date and get date from there
                        originalRow.children('.pickup-time').text(dateFormat(pickupTime, "mmmm dS, h:MM TT"));

                    },
                    error: function(err) {
                        console.log(err);
                        // TODO: tell user which ones failed
                    }
                })
            });

            // TODO: only close the modal if all items were successfully updated
            $('#deliver-now-modal').modal('toggle');
        }
    });

});
