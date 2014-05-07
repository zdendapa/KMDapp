

var lastRowID = 0;
var sheetCurrent = 0;
var rowUpdatedID = 0;



function onDeviceReady()
{
    //alert("onDeviceReady");
    init();
}

function onDeviceReadyDelay()
{
    //alert("onDeviceReadyDelay");
    init();
}

function init()
{


    if(!pgReady)
    {
        pgReady = true;
    } else
    return;




    $( document ).on('change', '.content input', function() {
        dbUpdater2(this);
        addRowCheck(this);
    });

    /*
    $('.content input').on('change', function() {
       dbUpdater2(this);
        alert("ads");
       addRowCheck(this);
    });
*/



    $('#categorySelectNext').on('click', function() {
        $("#categorySelect > option:selected")
            .prop("selected", false)
            .next()
            .prop("selected", true);
        db.loadSheet();
    });

    $('#categorySelectPrev').on('click', function() {
        $("#categorySelect > option:selected")
            .prop("selected", false)
            .prev()
            .prop("selected", true);
        db.loadSheet();
    });

    db.init();
    //fileInit();
}

function newWTable()
{
    logging("newWTable",1);
    //newWTableRender();
    db.CreateNextTable();
    //currentWtable = lastWtable;

    $("#category").val("");
    $("#code").val(-1)
    $("#planSpend").val("0.00");
    $("ul.content").empty();
    lastRowID  =0;
    addRow();
}

function newWTableRender()
{
    var newWtable = $("#first").html();
    newWtable = ('<div id="'+currentWtable+'" style="disply:block">'+newWtable+'</div>');
    $(".main").append(newWtable);
}

function recalculateBalance()
{
    var total = document.getElementById("planSpend").value;

    $(".content li").each(function(){
        var payment = $(this).find(".payment input").val();
        if(payment > 0)
        {
            total = parseFloat(Math.round((total-payment) * 100) / 100).toFixed(2);
            $(this).find(".last input").val(total);
        }
    });
}

function priceFormatCheck(el)
{
    value = el.value;
    var proceedUpdate = true;

    // is it positive number?
    if(isNaN(Number(value)) || Number(value)<0)
    {
        alert("Plan to spend must be positive real number");
        $("#planSpend").val("0");
        proceedUpdate = false;
    }

    // has this number ".00" ?
    var elSlinc = value.split(".");
    if(elSlinc.length == 1 && proceedUpdate)
    {
        value = value + ".00";
        el.value = value;
    }

    recalculateBalance();
    db.headerUpdate();

}

function dateFormatCheck(el)
{
    value = el.value;
    if(value.length>0)
    {
        elSlinc = value.split("/");
        if(elSlinc.length < 2 || elSlinc.length > 3)
        {
            alert("Date format must be: 'D/M' or D/M/YY");
        }
    }
}

function addRowCheck(el)
{
    var thisRowID = $(el).parent().parent().attr("data-id");
    if(thisRowID == lastRowID)
    {
        addRow();
    }

}

function addRow()
{
    logging("addRow",1);
    lastRowID ++;
    //$("ul.content").append('<li onchange="dbUpdater('+lastRowID+')" data-id="'+lastRowID+'"> <span class="dater"><input  onchange="dateFormatCheck(this)"></span> <span  class="paid"><input></span> <span class="description"><input onchange="addRowCheck(this)"></span> <span class="checkRef"><input></span> <span class="payment"><input onchange="priceFormatCheck(this);recalculateBalance()"></span> <span class="last"><input readonly></span> </li>');
    $("ul.content").append('<li data-id="'+lastRowID+'"> <span class="dater"><input  onchange="dateFormatCheck(this)"></span> <span  class="paid"><input></span> <span class="description"><input></span> <span class="checkRef"><input></span> <span class="payment"><input onchange="priceFormatCheck(this);recalculateBalance()"></span> <span class="last"><input readonly></span> </li>');
}

function updateHeader()
{
    var proceedUpdate = true;
    var category = $("#category").val();
    var code = $("#code option:selected").text();
    var planSpend = $("#planSpend").val();

    // fields validation
    if(isNaN(Number(planSpend)))
    {
        alert("Plan to spend must be positive real number");
        $("#planSpend").val("0");
        proceedUpdate = false;
    }

    if(proceedUpdate) dbUpdateHeader();
}

function categorySelectUpdate()
{
    $( "#categorySelect option:selected" ).text($('#category').val());
}

function shidCurrentGet()
{
    return $("#categorySelect option:selected").val();
}

function dbUpdater2(el)
{
    rowUpdatedID = $(el).parent().parent().attr("data-id");
    db.rowUpdateInsert();
    //db.transaction(dbUpdateQ, errorCB);
}

//-------------------------------------------------------------------
// level: 1=INFO, 2=WARNING, 3=ERROR
var logging = function(str, level) {
            if (level == 1) console.log("INFO:" + str);
            if (level == 2) console.log("WARN:" + str);
            if (level == 3) alert("ERROR:" + str);
};
