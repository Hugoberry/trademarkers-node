

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
        // alert("Please Enter Class");
        $("#errorMessage").text("Please Enter Class").show()
        scrollToDiv("errorMessage")
        return false;
    }

    if (addClassValue > 45 || addClassValue <= 0) {
        // alert("Please Enter Class(es) 1 - 45");
        $("#errorMessage").text("Please Enter Class(es) 1 - 45").show()
        scrollToDiv("errorMessage")
        return false;
    }


    var selected = $("input:checkbox.class_chk:checked").map(function(){
      return $(this).val();
    }).get(); 

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

  if ($('input[name="type"]').length) {
    var type = localStorage.getItem('type');
    type = type ? type : 'word'
    $("input[name=type][value=" + type + "]").attr('checked', 'checked');

    if (type === 'word') {
      $("#upload").hide()
    } else {
      $("#upload").show()
    }
  }

  $('input[name="type"]').change(function(){
    // alert($(this).val());
    localStorage.setItem('type', $(this).val());
    if ($(this).val() == 'word') {
      $("#upload").hide()
      $("#logo_pic").prop('required',false);
      
      
    } else {
      $("#upload").show()
      $("#logo_pic").prop('required',true);
    }
  });

  $(document).on('click','#listClasses .btnRemoveClass',function(e) {
    
    let value = $(this).data('class-number');

    $('input:checkbox.class_chk').each(function () {
      if ( $.trim($(this).val()) === $.trim(value) ){
        $(this).prop("checked", false)
      }
    })

    listPopulate();
  });

  $(".removeCartItem").click(function(){
    // alert( $(this).attr('data-id') );

    $.ajax({
      url: "/api/v1/removeCartItem",
      type:"post",
      data: {
        id: $(this).attr('data-id')
      },
      success: function( result ) {
        location.reload();
        
      }
    });   

  });

  $(".updateCartStatus").click(function(){
    // alert( $(this).attr('data-id') );

    $.ajax({
      url: "/api/v1/updateCartStatus",
      type:"post",
      data: {
        id: $(this).attr('data-cart-id'),
        status: $(this).attr('data-cart-status'),
      },
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
                // localStorage.removeItem('colorClaim');
                // localStorage.removeItem('type');
                $("#addToCart").trigger('submit')
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

  // VERIFY EMAIL
  if ( $("#verify-resend").length ) {
    var verifyFlag = true;
    $("#verify-resend").click(function(){

      if (!verifyFlag) {
        return false;
      }

      $.ajax({
        url: "/api/v1/verify/resend",
        type:"POST",
        dataType:"json",
        async: false,
        contentType: "application/json",
        success: function( result ) {
          console.log(result);
          verifyFlag = false;
          $("#verifyMessage").show()
        }
      });
    });
  }

  $("#priority").change(function(){
    if ( $(this).val() == "yes" ) {
      $("#yes_priority").show()
    } else {
      $("#yes_priority").hide()
    }
  })

  $("#filed").change(function(){
    if ( $(this).val() == "yes" ) {
      $("#claim_priority").show()
    } else {
      $("#claim_priority").hide()
    }
  })

  if ($('input[name="colorClaim"]').length) {
    var colorClaim = localStorage.getItem('colorClaim');
    colorClaim = colorClaim ? colorClaim : 'no'
    $("input[name=colorClaim][value=" + colorClaim + "]").attr('checked', 'checked');

    if (colorClaim === 'no') {
      $("#colorClaimText").hide()
    } else {
      $("#colorClaimText").show()
    }
  }

  // localStorage.setItem('type', $(this).val());
  

  $('input[name="colorClaim"]').change(function(){
    
    localStorage.setItem('colorClaim', $(this).val());
    if( $(this).val() == "yes") {
      $("#colorClaimText").show()
      $('input[name="colorClaimText"]').val('').focus()
      $('input[name="colorClaimText"]').prop('required',true);
    } else {
      $("#colorClaimText").hide()
      $('input[name="colorClaimText"]').val('')
      $('input[name="colorClaimText"]').prop('required',false);
    }

  })

  // PROFILE SCRIPT FORM VALIDATE
  $("#nature").change(function(){
    // alert($(this).val());
    if ($(this).val() == "Individual") {

      $("#company_block > div").hide()
      $("#nature-label h4").text('Client Information');
      $("#fax-block").show();
      $("#position-block").hide();
      $("#wrap-company-address").hide()

    } else {

      $("#company_block > div").show()
      $("#nature-label h4").text('Contact Person');
      $("#fax-block").hide();
      $("#position-block").show();
      $("#wrap-company-address").show()
      
    }
  })

  $("#filing_form").on("submit",function(){
    let flag = true;
    let message = "";
    $(".classDescriptions").each(function() {
      if ( !$(this).val() ){
        flag = false;
        message = "Please enter class description"
        // $(this).focus()
      } 
    })

    // alert($('input[name="type"]').val());
    // return false
    // if ($('input[name="type"]').val() != 'word') {

    //   alert($("#logo_pic").val());
    //   flag = false;
    // } 

    let classvalue = $(".class").val()
    let classValues = $('input:checkbox.class_chk:checked').serialize()

    if (!classValues) {
      message = "Please Enter Class";
      flag = false;
    }
      



    if (!flag) {
      $("#errorMessage").text(message).show()
      scrollToDiv("errorMessage")
    }
    return flag
  })

  if ( $("#contactMessage").length ) {
    $('html, body').animate({
      scrollTop: $('#contactMessage').offset().top
    }, 'slow');
  }

  if ( $("#quoteType").length ) {
    // alert($("#quoteType").val());
    checkFieldShow( $("#quoteType").val() );
  }



// =====================================================
//  functions below
// =====================================================

function listPopulate() {

  // var class_description = null;
    let liHeadDisplay='<thead><tr><td> <b>Class Number</b></td><td> <b>Description</b></td><td>Price</td><td class="text-center"> <b>Action</b></td></tr></thead>';
    let liDisplay='';
    let i = 0, totalAmount = 0;
    $('input:checkbox.class_chk').each(function () {
      
        var sThisVal = (this.checked ? $(this).val() : "");
        // console.log('val',sThisVal);

        if ( sThisVal ) {
            i++
            let classNumber = sThisVal.replace("class","");
            // let classDescriptionValue = sThisVal.val
            // console.log( 'description',$("#class"+classNumber).val(), sThisVal )

            let class_description = $("#class"+classNumber).val() ? $("#class"+classNumber).val() : ''

            // console.log($("#class"+classNumber).length);
            if ( $("#class"+classNumber).val() === sThisVal ) {
              class_description = ''
              // console.log('empty');
            }

            // get price
            let classAmount = 0, classAmountAdd = 0, classAmountItem = 0;
            if ($('input[name="type"]').val() == 'word') {
              classAmount = $('#initial_cost').val()
              classAmountAdd = $('#additional_cost').val()
            } else {
              classAmount = $('#logo_initial_cost').val()
              classAmountAdd = $('#logo_additional_cost').val()
            }

            if (i == 1) {
              classAmountItem = classAmount
            } else {
              classAmountItem = classAmountAdd
            }
            
            totalAmount += parseInt(classAmountItem)

            let description_input = '<input id="class'+classNumber+'" value="'+class_description+'" type="text" class="form-control classDescriptions" name="description" placeholder="Enter Goods/Services on this trademark" data-id="'+classNumber+'">';

            liDisplay += "<tr>" + 
                            "<td>" + classNumber + "</td>" +
                            "<td>" + description_input + "</td>" +
                            "<td>$" + classAmountItem + "</td>" +
                            "<td class='text-center'> <i data-class-number='" +classNumber+"' class='fa fa-trash btnRemoveClass'></i>" + "</td>" +

                          "</tr>";

                          

            
        }

    });

    liDisplay += "<tr>" +
                      "<td colspan='3' class='text-right' style='font-weight:bold'>Total</td>" +
                      "<td class='text-center' style='font-weight:bold'>$"+totalAmount+"</td>" +
                      "</tr>";

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

function checkFieldShow($type) {
  if ( $type == 'office action response' 
      || $type == 'appeal a final refusal'
      || $type == 'trademark statement of use'
      || $type == 'revive an abandoned application'
      || $type == 'trademark opposition'
  ) {
      // show showNeeded
      $('.showNeeded').show();

      // return true;
  } else {
      $('.showNeeded').hide();
      // return false;
  }

  if ($type == 'trademark statement of use') {
      $(".showRegistration").show();
  } else {
      $(".showRegistration").hide();
  }

  if ($type == 'international trademark application') {
      $(".showCountryDesignate").show();
      $(".showClass").show();
      // $(".showCountry").hide();
  } else {
      $(".showCountryDesignate").hide();
      $(".showClass").hide();
      // $(".showCountry").show();
  }

  if ($type == 'Trademark Opposition' || $type == 'Letter of Protest for Prior Registered TM Holders' || $type == 'Letter of Protest for Domain Owners') {
      $(".showOppo").show();
  } else {
      $(".showOppo").hide();
  }

  
}

function scrollToDiv(id){
  $('html, body').animate({
    scrollTop: $("#"+id).offset().top
  }, 500);
}


})

