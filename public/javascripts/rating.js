// Author: Cheahuychou Mao
// js for rating other users

$(document).ready(function () { 
    var setRating = function() {
      return $('.rating .fa').each(function() {
        if (parseInt($('.rating .fa').siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
          return $(this).removeClass('fa-star-o').addClass('fa-star');
        } else {
          return $(this).removeClass('fa-star').addClass('fa-star-o');
        }
      });
    };

    $('.rating .fa').on('click', function() {
      $('.rating .fa').siblings('input.rating-value').val($(this).data('rating'));
      return setRating();
    });

    setRating();
});