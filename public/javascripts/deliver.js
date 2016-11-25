// Author: Czarina Lao
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
                    addMessage('Request claimed! It has been added to your dashboard.', 'success', true);
                } else {
                    console.log(data.message);
                    addMessage('The request could not be claimed. Note that you won\'t be able to claim your own requests.', 'danger', true);
                }
            },
            error: function(err) {
                console.log(err);
                addMessage('A network error might have occurred. Please try again.', 'danger', true);
            }
        });
    });
});
