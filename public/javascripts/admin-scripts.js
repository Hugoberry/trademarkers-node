$( document ).ready(function() {

  let taskCounter = 2;

  if ( $("#myListDataTable").length ) {
    $("#myListDataTable").DataTable();
  }


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
                          <textarea class="form-control" name="details[${taskCounter}][taskDescription]"></textarea>
                      </div>
                      <input type="hidden" class="form-control" value="pending" name="details[${taskCounter}][task_status]">
                  </div>`);
      taskCounter++;
    }

    if ( taskCounter > 4) {
      $("#add-block").hide();
    }
  });

})