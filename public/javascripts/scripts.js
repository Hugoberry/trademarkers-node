$( document ).ready(function() {

  $('#login-from').submit(function(){
    console.log('attempt.. ');
      $.ajax({
        url: "/login/auth2",
        type:"post",
        data: {
          "username": $("#username").val(),
          "password": $("#password").val()
        },
        success: function( result ) {
          console.log($("#username").val());
          if ( result.status == true ) {
            console.log(result.user);
            // if ( result.user.role_id == 4 ){
            //   document.location.href = '/researcher';
            // } else if ( result.user.role_id == 5 ) {
            //   document.location.href = '/njs-admin';
            // } else {
            //   document.location.href = '/customer';
            // }
            document.location.href = '/customer';
            // document.location.href = '/researcher';
          } else {
            $(".alert-warning strong").html(result.message);
            $(".alert-warning").show();
          }
        }
      });     
      
      return false;
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


  $(".btn-add-class").click(function(){

    $(".show-pop").show();

    $(".show-pop .dropdown-toggle").attr("aria-expanded","true");
    $(".show-pop .open").addClass("show");
  });

  $("#addClassValue").change(function(){
    let addClassValue = $("#addClassValue").val();
    let varSelected = "class" + addClassValue;

    if (!addClassValue) {
        alert("Please Enter Class");
        return false;
    }

    if (addClassValue > 45 || addClassValue <= 0) {
        alert("Please Enter Class(es) 1 - 45");
        return false;
    }
    
    $("#"+varSelected).trigger("click");
    $("#addClassValue").val('');
    listPopulate();
    
    $(".show-pop").hide();

  });

  $("#frm-action-register").submit(function(){

    var selectedCountry = $("#selectedCountry").val();
    var service = $("#trademarker-service").val();
    var urlAction = "";

    if (service == "trademark-registration"){
      urlAction = "registration/step2/" + selectedCountry
    } else {
      urlAction = "study/step2/" + selectedCountry
    }

    this.action = this.action + urlAction;

    // return false;
  });

  if ( $("#listClasses").length ) {
    listPopulate()
  }


  if ( $("#contact-form").length ) {

    $("#contact-form").submit(function(){
      // add loader and disable button
      $("#contact-btn-submit").hide('slow')
      $("#contact-btn-submit").prop('disabled', false);
    });

    $("#inquiry").change(function(){
      let message = $(this).val()
      // alert(message);
      if (message) 
      $("#messageContainer").html(`<textarea class="form-control" value="" rows="7" name="message" placeholder="Inquiry for ${message}" required></textarea>`);

    });
  }

  $('input[name="type"]').change(function(){
    // alert($(this).val());
    if ($(this).val() == 'word') {
      $("#upload").hide()
    } else {
      $("#upload").show()
    }
  });

  $("#filing_form").submit(function(){
    let classvalue = $(".class").val()
    let classValues = $('input:checkbox.class_chk:checked').serialize()

    if (!classValues) {
      alert('Please Enter Class');
      
      return false;
    }
    
  })

  $(document).on('click','#listClasses .btnRemoveClass',function(e) {
    let value = $(this).data('class-number');
    let classNumber = "class" + value;

    var this_class = $("."+classNumber);
    // console.log(this_class);
    $("#"+classNumber).trigger('click');

    $(".reset").removeClass('hide-class');

    listPopulate();
  });

  $(".removeCartItem").click(function(){
    // alert( $(this).attr('data-id') );

    $.ajax({
      url: "/api/v1/removeCartItem",
      type:"GET",
      dataType:"json",
      data: {
        id: $(this).attr('data-id')
      },
      contentType: "application/json",
      success: function( result ) {
        location.reload();
        
      }
    });   

  });

  // get cart items count
  $.ajax({
    url: "/api/v1/getcartItems",
    type:"GET",
    contentType: "application/json",
    success: function( result ) {
      $("#shopping-cart").text(result.count)
      // console.log(result);
    }
  });    

  $("#addToCart").submit(function(){

    if( $('input[name="customerType"]').val() ) {

      if ( $('input[name="customerType"]:checked').val() == 'old' ) {

        // check if both fields are not empty
        if ( !$("#email").val() || !$("#customerPassword").val() ) {
          // message field
          $("#loginMessage").text('Please enter your Email/Password').show()

          return false;

        } else {
          // check cedentials
          $.ajax({
            url: "/login/auth",
            type:"GET",
            dataType:"json",
            data: {
              username: $("#email").val(),
              password: $("#customerPassword").val(),
            },
            contentType: "application/json",
            success: function( result ) {
              console.log(result);
  
              if (!result.status) {
                $("#loginMessage").text(result.message).show()
                return false;
              } else {
                location.reload();
              }
              
            }
          }); 
        }
        // try to login
       
      } else {
        // process and login customer
        if ( 
            !$("#email").val() || 
            !$("#customerPassword").val() ||
            !$("#name").val() ||
            !$("#address").val() 
          ){
            let message="";
            
            
            if (!$("#email").val()) {
              message += "Please Enter Email<br>"
            }

            if (!$("#customerPassword").val()) {
              message += "Please Enter Password <br>"
            }

            if (!$("#name").val()) {
              message += "Please Enter Name <br>"
            }

            if (!$("#address").val()) {
              message += "Please Enter Address "
            }

            $("#loginMessage").html(message).show()

            return false;
        } else {

          $.ajax({
            url: "/api/v1/checkEmailExist",
            type:"GET",
            dataType:"json",
            data: {
              email: $("#email").val()
            },
            contentType: "application/json",
            success: function( result ) {
              console.log(result);
              if (result) {

                $("#loginMessage").text("Email Already Exist").show()
                return false

              } else {

                // add customer and add cart item

              }
            }
          });  
        }

      }

      
    } 

    // $.ajax({
    //   url: "/api/v1/checkEmailExist",
    //   type:"GET",
    //   dataType:"json",
    //   data: {
    //     email: $("#email").val()
    //   },
    //   contentType: "application/json",
    //   success: function( result ) {
    //     console.log(result);
        
    //   }
    // });  
    
    // return false

  });

  $('input[name="customerType"]').change(function(){

    if ($(this).val() == 'old') {
      $("#name").hide()
      $("#address").hide()
    } else {
      $("#name").show()
      $("#address").show()
    }
  });

  

// =====================================================
//  functions below
// =====================================================

function listPopulate() {

  var class_description = null;
    let liHeadDisplay='<thead><tr><td> <b>Class Number</b></td><td> <b>Description</b></td><td class="text-center"> <b>Action</b></td></tr></thead>';
    let liDisplay='';
    $('input:checkbox.class_chk').each(function () {
        var sThisVal = (this.checked ? $(this).val() : "");
        // console.log(sThisVal);

        if ( sThisVal ) {
            
            console.log(sThisVal);
            let classNumber = sThisVal.replace("class","");

            let description_input = '<input id="class7" type="text" class="form-control" name="description" placeholder="Enter Goods/Services on this trademark" data-id="'+classNumber+'">';

            liDisplay += "<tr>" + 
                            "<td>" + classNumber + "</td>" +
                            "<td>" + (class_description ? class_description[classNumber] : description_input )+ "</td>" +
                            "<td class='text-center'> <i data-class-number='" +classNumber+"' class='fa fa-trash btnRemoveClass'></i>" + "</td>" +

                          "</tr>";

                          

            
        }

    });
    $("#listClasses").html(liHeadDisplay);
    $("#listClasses").append(liDisplay ? liDisplay : "<tr><td colspan='3' class=''>No selected class. Please select class below.</td></tr>");

    let hasCampaign = $(".hasCampaign").attr('data-hasCampaign');
    let isPriority = $("#priority").attr('data-isPriority');

    if (hasCampaign) {
        $("#filed").val('yes');
        $("#filed").trigger('change');
    }

    if (isPriority) {
        $("#priority").val('yes');
        $("#priority").trigger('change');

        $("#date").val($("#date").attr('data-case-value'));
        $("#tm").val($("#tm").attr('data-case-value'));
    }

}


})