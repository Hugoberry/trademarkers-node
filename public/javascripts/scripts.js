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
})