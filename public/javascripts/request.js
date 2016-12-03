// Author: Czarina Lao
$(document).ready(function() {
    $('.price').change(function() {
        showPriceFormatErrors(this);
    });

    $('input[name=item-due]').change(function() {
        if (new Date($(this).val()+getFormattedTimezoneOffset()) < Date.now()) {
            if (!$(this).parent().hasClass('has-error')) {
                $(this).parent().addClass('has-error');
            }
        } else {
            $(this).parent().removeClass('has-error');
        }
    });

	$('#make-request').click(function() {
        var hasError = false;
        // validate inputs first
        $('input').each(function() {
            // check that all inputs are nonempty
            // if empty, alert the user of the error and show where it is
            if ($(this).attr('required') && (!$(this).val() || $(this).val().trim()=='')) {
                if (!$(this).parent().hasClass('has-error')) {
                    $(this).parent().addClass('has-error');
                }
                hasError = true;
                addMessage('All fields must be filled out.', 'danger', false, true);
                return false;
            } else if ($(this).hasClass('price')
                && $(this).parent().hasClass('has-error')) {
                // check if valid prices are entered
                hasError = true;
                addMessage('Please enter a valid price.', 'danger', false, true);
                return false;
            } else if ($(this).attr('name') == 'item-due'
                && $(this).parent().hasClass('has-error')) {
                // check if deadline is in the future
                hasError = true;
                addMessage('Please enter a date and time after the current date and time.', 'danger', false, true);
                return false;
            } else {
                $(this).parent().removeClass('has-error');
            }
        });

        if (!hasError) {
            // TODO: what if only some items are successful
            $('.item').each(function () {
                var num = $(this).attr('data-num');
                // get all field values
                var name = $(this).find('#item-name-'+num).val();
                var quantity = $(this).find('#item-qty-'+num).val();
                var priceEstimate = $(this).find('#item-price-estimate-'+num).val();
                var stores = $(this).find('#item-stores-'+num).val();
                var deadline = $(this).find('#item-due-' + num).val();
                var pickupLocation = $(this).find('#item-pickup-location-'+num).val();
                var tips = $(this).find('#item-tip-'+num).val();
                var description = $(this).find('#item-description-'+num).val();
                var csrf = $('#csrf').val();
                console.log(csrf);

                console.log(name, quantity, priceEstimate, stores, deadline, pickupLocation, tips, description);

                $.post('/deliveries', {
                    itemName: name,
                    itemQty: quantity,
                    itemPriceEstimate: priceEstimate,
                    itemDue: new Date(deadline+getFormattedTimezoneOffset()),
                    stores: stores,
                    itemDescription: description,
                    itemTips: tips,
                    itemPickupLocation: pickupLocation,
                    _csrf: csrf
                }, function(data) {
                    if (!data.success) {
                        console.log(data.message);
                        addMessage('Request submission failed. Please try again.', 'danger', false, true);
                    } else {
                        // clear form after submitting successfully
                        $('#request-form').find('input').val('');
                        addMessage('Request submitted. You can check the status of your requests on your dashboard.', 'success', false, true);
                    }
                });
            });
        }
  	});

    $('#add-item').click(function() {
        var lastNum = parseInt($('tbody tr:last-child').attr('data-num'));
        // copy the HTML from the last item
        // TODO: (or not) even the attributes of the last item are copied
        // even the .has-error classes which may be fine or not
        $('tbody').append($('.item').last().prop('outerHTML'));
        var newRow = $('tbody tr:last-child');
        // update ids of new row
        var oldId = newRow.attr('id');
        newRow.attr('id', oldId.replace(lastNum, lastNum+1));
        newRow.attr('data-num', lastNum+1);
        newRow.find('input,select,button').each(function() {
            var oldId = $(this).attr('id');
            $(this).attr('id', oldId.replace(lastNum, lastNum+1));
        });
        newRow.find('.item-remove').click(function() {
            var newNum = lastNum+1;
            $('.item[data-num='+newNum+']').remove();
            if ($('.item').length === 1) {
                $('.item-remove').prop('hidden', true);
            }
        });
        // attach listeners to new row
        newRow.find('.price').change(function() {
            showPriceFormatErrors(this);
        });
        newRow.find('input[name=item-due]').change(function() {
            if (new Date($(this).val()+getFormattedTimezoneOffset()) < Date.now()) {
                if (!$(this).parent().hasClass('has-error')) {
                    $(this).parent().addClass('has-error');
                }
            } else {
                $(this).parent().removeClass('has-error');
            }
        });
        $('.item-remove').prop('hidden', false);
    });

    $('.item-remove').click(function() {
        var dataNum = $(this).parent().parent().attr('data-num');
        $('.item[data-num='+dataNum+']').remove();
        if ($('.item').length === 1) {
            $('.item-remove').prop('hidden', true);
        }
    });
});
