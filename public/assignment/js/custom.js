$.ajax('http://api.bigfoot.com/comm', 
{
    dataType: 'json', // type of response data
    success: function (data,status,xhr) {   // success callback function
        console.log(data);
    },
    error: function (jqXhr, textStatus, errorMessage) { // error callback 
        console.log(errorMessage);
    }
});