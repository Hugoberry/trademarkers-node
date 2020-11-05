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
            console.log(result, 'result');
          }
        });     
        
        return false;
    });
})