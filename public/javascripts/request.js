$(document).ready(function() {
	$('#make-request').click(function() {
		var num = 1;
		$('.item').each(function () {
			var name = $(this).find('#item-name-'+num).val();
			var quantity = $(this).find('#item-qty-'+num).val();
			var priceEstimate = $(this).find('#item-price-estimate-'+num).val();
			var stores = $(this).find('#item-stores-'+num).val();
			var deadline = $(this).find('#item-due-' + num).val();
			var pickupLocation = $(this).find('#item-pickup-location-'+num).val();
			var tips = $(this).find('#item-tip-'+num).val();
			var description = $(this).find('#item-description-'+num).val();
			console.log(name, quantity, priceEstimate, stores, deadline, pickupLocation, tips, description);
			num += 1;
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
	            alert('Request submission failed. Please try again');
	          } 
	        });  
		});     
  	});
});