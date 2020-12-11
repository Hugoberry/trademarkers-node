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
            console.log(result.user);
            if ( result.user.role_id == 4 ){
              document.location.href = '/researcher';
            } else if ( result.user.role_id == 5 ) {
              document.location.href = '/njs-admin';
            } else {
              document.location.href = '/home';
            }
            // document.location.href = '/researcher';
          } else {
            $(".alert-warning strong").html(result.message);
            $(".alert-warning").show();
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