// Author: Czarina Lao
$(document).ready(function() {
    flatpickr("input[name=item-due]", {
        enableTime: true,
        // minDate seems to have a bug so not using it for now
        // minDate: 'today',
        enable: [{from:'today', to: new Date().fp_incr(1000)}],
        // create an extra input solely for display purposes
        altInput: true,
        altFormat: "F j, Y h:i K"
    });

    $('#navbar-request').addClass('active');
    $('.price').change(function() {
        // price estimate > 0, while other prices >= 0
        var isZeroOk = $(this).attr('name') !== 'item-price-estimate';
        showPriceFormatErrors(this, isZeroOk);
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
                addMessage('All fields except More Info are required.', 'danger', false, true);
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
            // get all field values
            var name = $('input[name=item-name]').val();
            var quantity = $('input[name=item-qty]').val();
            var priceEstimate = $('input[name=item-price-estimate]').val();
            var stores = $('select[name=item-stores]').val();
            var deadline = $('input[name=item-due]').val();
            var pickupLocation = $('select[name=item-pickup]').val();
            var tips = $('input[name=item-tip]').val();
            var minShopperRating = $('select[name=minimum-shopper-rating').val();
            var description = $('input[name=item-description]').val();
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
                minShippingRating: minShopperRating,
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
        }
  	});
});
