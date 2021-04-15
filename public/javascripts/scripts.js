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


    var selected = $("input:checkbox.class_chk:checked").map(function(){
      return $(this).val();
    }).get(); 
    console.log(addClassValue,selected);

    console.log($.inArray(addClassValue,selected));

    if ( $.inArray(addClassValue,selected) >= 0 ) {
      alert("Class already selected");
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

  $(".btn-close-class").click(function(){
    $(".show-pop").hide();
  });


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

  $("#btn-add-to-cart").click(function(){

    var submitFlag = true;

    $("#btn-add-to-cart").hide();

    const emailRegexp = /[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,4}/;

    if (!emailRegexp.test($("#email").val())) {
      $("#loginMessage").text('Please enter your Email').show()
      $("#email").focus()
      $("#btn-add-to-cart").show();
      return false;
    }

    if( $('input[name="customerType"]').val() ) {

      if ( $('input[name="customerType"]:checked').val() == 'old' ) {

        // check if both fields are not empty
        if ( !$("#email").val() || !$("#customerPassword").val() ) {
          // message field
          $("#loginMessage").text('Please enter your Email/Password').show()
          $("#btn-add-to-cart").show();
        } else {
          // check cedentials
          $.ajax({
            url: "/login/auth2",
            type:"post",
            data: {
              'username': $("#email").val(),
              'password': $("#customerPassword").val(),
            },
            success: function( result ) {
  
              if (!result.status) {
                $("#loginMessage").text(result.message).show()
                $("#btn-add-to-cart").show();
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
            !$("#customerPasswordConfirm").val()
          ){
            let message="";
            
            
            if (!$("#email").val()) {
              message += "Please Enter Email<br>"
              $("#btn-add-to-cart").show();
            }

            if (!$("#customerPassword").val()) {
              message += "Please Enter Password <br>"
              $("#btn-add-to-cart").show();
            }

            if (!$("#customerPasswordConfirm").val()) {
              message += "Please Enter Password <br>"
              $("#btn-add-to-cart").show();
            }

            $("#loginMessage").html(message).show()

        } else if( $("#customerPassword").val() != $("#customerPasswordConfirm").val() ) {

          $("#loginMessage").html("Mismatch password").show()
          $("#btn-add-to-cart").show();
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
              
              // let res = $.parseJSON(result)
              console.log(result);

              if ( typeof result.email != "undefined") {
                $("#loginMessage").text("Email Already Exist").show()
                $("#btn-add-to-cart").show();
              } else {
                // alert('trigger');
                // $("#addToCart").trigger('submit')
              }
            }
          });  

        }

      }

      
    } 

  });

  $("#addToCart").submit(function(){
    const emailRegexp = /[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,4}/;

    if ( $("#email").length && !emailRegexp.test($("#email").val())) {
      alert('Please Enter email address')
      $("#email").focus()
      return false;
    }
  })

  // if ( $("#addToCart").length ) {
  //   $.ajax({
  //     url: "/api/v1/checkEmailExist",
  //     type:"GET",
  //     dataType:"json",
  //     data: {
  //       email: $("#email").val()
  //     },
  //     contentType: "application/json",
  //     success: function( result ) {
  //       console.log(result);
  //       if (result) {

  //         $("#loginMessage").text("Email Already Exist").show()
  //         return false

  //       }
  //     }
  //   }); 
  // }

  // if ( $("#email").length ) {
  //   $("#email").blur(function(){
  //     alert('asd');
  //   });
  // }

  

  $('input[name="customerType"]').change(function(){

    if ($(this).val() == 'old') {
      $("#customerPasswordConfirm").hide()
    } else {
      $("#customerPasswordConfirm").show()
    }
  });

  $("#signupbutton").click(function() {
    
    if ( $("#password").val() != $("#password-confirm").val() ) {
      // alert("invalid");
      $("#alert-message").html("<strong>Password Mismatch</strong>");
      $("#alert-message").show()
      // return false
    }

    $.ajax({
      url: "/api/v1/checkEmailExist",
      type:"GET",
      dataType:"json",
      async: false,
      data: {
        email: $("#email").val()
      },
      contentType: "application/json",
      success: function( result ) {
        console.log(result);
        if (result.email) {

          $("#alert-message").html("<strong>Email Already Exist</strong>");
          $("#alert-message").show()

        } else if($("#password").val() != $("#password-confirm").val()){ 

          $("#alert-message").html("<strong>Password Mismatch</strong>");
          $("#alert-message").show()

        } else {
          $("#signupForm").trigger("submit")
        }
      }
    }); 

    // return false
  })

  // PROFILE SCRIPT FORM VALIDATE
  $("#nature").change(function(){
    // alert($(this).val());
    if ($(this).val() == "Individual") {
      // console.log('in');
      // hide other fields
      $("#company_block > div").hide()
      $("#nature-label h4").text('Client Information');
      $("#fax-block").show();
      $("#position-block").hide();
    } else {
      // console.log('com');
      $("#company_block > div").show()
      $("#nature-label h4").text('Contact Person');
      $("#fax-block").hide();
      $("#position-block").show();
      
    }
  })

  

// =====================================================
//  functions below
// =====================================================

function listPopulate() {

  // var class_description = null;
    let liHeadDisplay='<thead><tr><td> <b>Class Number</b></td><td> <b>Description</b></td><td class="text-center"> <b>Action</b></td></tr></thead>';
    let liDisplay='';
    $('input:checkbox.class_chk').each(function () {
        var sThisVal = (this.checked ? $(this).val() : "");
        // console.log('val',sThisVal);

        if ( sThisVal ) {
            
            let classNumber = sThisVal.replace("class","");
            // let classDescriptionValue = sThisVal.val
            // console.log( 'description',$("#class"+classNumber).val(), sThisVal )

            let class_description = $("#class"+classNumber).val() ? $("#class"+classNumber).val() : ''

            // console.log($("#class"+classNumber).length);
            if ( $("#class"+classNumber).val() === sThisVal ) {
              class_description = ''
              // console.log('empty');
            } 
            
            
            let description_input = '<input id="class'+classNumber+'" value="'+class_description+'" type="text" class="form-control" name="description" placeholder="Enter Goods/Services on this trademark" data-id="'+classNumber+'">';

            liDisplay += "<tr>" + 
                            "<td>" + classNumber + "</td>" +
                            "<td>" + description_input + "</td>" +
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