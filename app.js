$( document).ready(function() {
    const form1 = $("#display");

    form1.submit(function( event ){
        event.preventDefault();
        $("#target").val("Got it!");
        $("#target2").text("Target 2 grabbed.");
    });
});

function getData(){}