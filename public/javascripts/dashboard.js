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

    $('.delivery-item-row').click(function() {
        var rowCheckbox = $(this).children('.checkbox-cell').children('input');
        // toggle row checkbox
        rowCheckbox.prop('checked', !rowCheckbox.prop('checked'));
    });

    $('.header-checkbox').change(function() {
        if (this.checked) {
            $('.checkbox-cell input').prop('checked', true);
        } else {
            $('.checkbox-cell input').prop('checked', false);
        }
    })

});
