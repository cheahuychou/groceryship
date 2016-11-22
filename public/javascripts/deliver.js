$(document).ready(function () {
    $('.claim-request').click(function() {
        var id = $(this).parent().parent().attr('data-id');
        $.ajax({
            url: '/deliveries/'+id+'/claim',
            type: 'PUT',
            data: {id: id},
            success: function(data) {
                console.log(data);
                if (data.success) {
                    $('.request-item-row[data-id='+id+']').remove();
                    // TODO: show message that claim was successful
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
});
