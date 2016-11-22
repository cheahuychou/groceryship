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
    });

    $('#deliver-items').click(function() {
        $('.checkbox-cell input').each(function() {
            if (this.checked) {
                var originalRow = $(this).parent().parent();
                var row = $('<tr>', {
                    class: 'to-deliver-item',

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

    // clear modal inputs on close
    $('#deliver-now-modal').on('hidden.bs.modal', function (e) {
        $('#deliver-now-modal tbody').empty();
    });

});
