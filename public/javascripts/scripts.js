$( document ).ready(function() {

  $('#login-from').submit(function(){
      $.ajax({
        url: "/login/auth",
        type:"GET",
        dataType:"json",
        data: {
          username: $("#username").val(),
          password: $("#password").val()
        },
        contentType: "application/json",
        success: function( result ) {

          if ( result.status == true ) {
            document.location.href = '/researcher';
          } else {
            conssole.log('sayup');
          }
        }
      });     
      
      return false;
  });

  $("#contact-form").submit(function(){
    // add loader and disable button
    $("#contact-btn-submit").prop('disabled', false);
  });

  $(document).on('click','#continentsToggle li',function(e) {
    // alert($(this).attr('data-abbr'));

    $("#continentsToggle li").removeClass('active');
    $(this).addClass('active');

    $(".continent").removeClass('show');
    $(".continent-"+$(this).attr('data-abbr') ).addClass('show');
    $("#selectedContinent").text($(this).attr('data-name'));
    $('#continentsToggle').collapse('hide');

  });



})