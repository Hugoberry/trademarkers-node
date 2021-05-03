$( document ).ready(function() {

  let taskCounter = 2;

  


  $("#add-block").click(function(){
    if ( taskCounter <= 4 ) {

      let html = $("#taskDetails");
      html.append(`<div class="col-md-6">
                      <div class="form-group">
                          <label>Task# ${taskCounter}</label>
                          <input type="hidden" class="form-control" value="${taskCounter}" name="details[${taskCounter}][task_number]">
                      </div>
                      <div class="form-group">
                          <label>Task Description/Scope</label>
                          <textarea class="form-control" name="details[${taskCounter}][task_description]"></textarea>
                      </div>
                      <input type="hidden" class="form-control" value="pending" name="details[${taskCounter}][task_status]">
                  </div>`);
      taskCounter++;
    }

    if ( taskCounter > 4) {
      $("#add-block").hide();
    }
  });



  if ( $("#myListDataTable").length ) {
    var tempTable = $("#myListDataTable").DataTable();

    tempTable.on('change',  '[name="markLead"]', function(){
      alert(this.checked);
      let value = this.checked;
      $.ajax({
        url: "/api/v1/olead/update",
        type:"post",
        dataType:"json",
        data: JSON.stringify({
          id: $(this).attr('data-id'),
          status : value
        }),
        contentType: "application/json",
        success: function( result ) {
  
          console.log(result);
        }
      });     
      
      // return false;
    });
  }

  $(".serviceAddCart").click(function(){
    
    $(this).hide();

    $.ajax({
      url: "/api/v1/carts/addService",
      type:"post",
      dataType:"json",
      data: JSON.stringify({
        serviceId: $(this).attr('data-attr-serviceId'),
        trademarkId: $(this).attr('data-attr-id'),
      }),
      contentType: "application/json",
      success: function( result ) {

        console.log(result);
      }
    }); 

  })

  $(".containerAddFeesBtn").on("click", function(){
    
    var field = `
        <div class="row" style="margin-top:10px">
          <input type="hidden" name="serviceId" value="">
          <div class="col-md-2"><input type="number" class="form-control" placeholder="Service Amount" name="addAmount" ></div>
          <div class="col-md-5"><textarea class="form-control" placeholder="Service Description" name="addAmountDescription" ></textarea></div>
          <div class="col-md-2"></div>
          <div class="col-md-2"></div>
          <div class="col-md-1"><i class="fa fa-trash deleteServiceNew"></i></div>
        </div>`;

    $("#containerAddFees").append(field);

    $(".deleteServiceNew").on("click", function(){
      deleteService($(this))
    })
  
  });

  $("#containerAddFees .deleteService").on("click", function(){
    
    id = $(this).attr('data-attr-id')
    alert(id);
    console.log(id);
    deleteService(this,id)

  })

  function deleteService(_this, _id) {

    if (_id) {
      // call ajax remove service
      $.ajax({
        url: "/api/v1/trademark-service/delete",
        type:"post",
        dataType:"json",
        data: JSON.stringify({
          id: _id
        }),
        contentType: "application/json",
        success: function( result ) {
  
          console.log(result);
        }
      }); 
    }
    _this.parent().parent().remove();
  }

})