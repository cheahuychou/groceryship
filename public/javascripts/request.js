var setMinDateTime = function () {
    var currentTime = new Date();
    var minDateTime = currentTime.getFullYear()  + "-" + (currentTime.getMonth()+1) + "-" + currentTime.getDate() + "T00:00:00";
    console.log(minDateTime)
    $('.datetimepicker').attr('min', minDateTime);
}

$(document).ready(function() {

	$('#make-request').click(function() {
        var currentTime = new Date();
        console.log(currentTime.toString())

		$('.item').each(function () {
            var num = $(this).attr('data-num');
			var name = $(this).find('#item-name-'+num).val();
			var quantity = $(this).find('#item-qty-'+num).val();
			var priceEstimate = $(this).find('#item-price-estimate-'+num).val();
			var stores = $(this).find('#item-stores-'+num).val();
            stores.forEach(function (store) {console.log('store', store, typeof store)});
			var deadline = $(this).find('#item-due-' + num).val();
			var pickupLocation = $(this).find('#item-pickup-location-'+num).val();
			var tips = $(this).find('#item-tip-'+num).val();
			var description = $(this).find('#item-description-'+num).val();
            
			console.log(name, quantity, priceEstimate, stores, deadline, pickupLocation, tips, description);
			$.post('/deliveries', {
	        	itemName: name,
	        	itemQty: quantity,
	        	itemPriceEstimate: priceEstimate,
	        	itemDue: deadline,
	        	stores: stores,
				itemDescription: description,
				itemTips: tips,
				itemPickupLocation: pickupLocation,	
	        }, function(data) {
	          if (!data.success) {
                console.log(data.message);
	            alert('Request submission failed. Please try again');
	          } 
	        });  
		});
        
        // clear form after submitting
        // TODO: only do this if successful
        $('#request-form').find('input').val('');   
  	});

    $('#add-item').click(function() {
        // TODO
        var lastNum = parseInt($('tbody tr:last-child').attr('data-num'));
        $('tbody').append($('.item').last().prop('outerHTML'));
        var newRow = $('tbody tr:last-child');
        console.log(newRow);
        // update ids of new row
        var oldId = newRow.attr('id');
        newRow.attr('id', oldId.replace(lastNum, lastNum+1));
        newRow.attr('data-num', lastNum+1);
        newRow.find('input,select,button').each(function() {
            var oldId = $(this).attr('id');
            console.log(oldId);
            $(this).attr('id', oldId.replace(lastNum, lastNum+1));
        });
        newRow.find('.item-remove').click(function() {
            var newNum = lastNum+1;
            $('.item[data-num='+newNum+']').remove();
            if ($('.item').length === 1) {
                $('.item-remove').prop('hidden', true);
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
