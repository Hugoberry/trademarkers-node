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

  if ( $(".classes_container").length ) {
    listPopulate()
  }






// =====================================================
//  functions below
// =====================================================

function listPopulate()
    {
      var class_description = null;
        let liHeadDisplay='<thead><tr><td> <b>Class Number</b></td><td> <b>Description</b></td><td class="text-center"> <b>Action</b></td></tr></thead>';
        let liDisplay='';
        $('input:checkbox.class_chk').each(function () {
            var sThisVal = (this.checked ? $(this).val() : "");
            // console.log(sThisVal);

            if ( sThisVal ) {
                
                console.log(sThisVal);
                let classNumber = sThisVal.replace("class","");

                let description_input = '<input id="class7" type="text" class="form-control" name="description[]" placeholder="Enter Goods/Services on this trademark" data-id="'+classNumber+'">';

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