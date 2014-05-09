/*
start app
- create tables
- read file for synchronize
    if modification > then db.lastExportDate =  read data from file
 */

var lastRowID = 0;
var sheetCurrent = 0;
var rowUpdatedID = 0;
var categorySelectPrev = "Instructions";
var firstInsert = false;

var currentDate = new Date();
logging("currentDate:" + currentDate,1);
var syncDate;
syncDate = "";

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

    $( document ).on('click', '.instructions input', function() {
        startTable(this);
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
    //$("#code").val(0);
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
    var underValue = false;
    $(".content li").each(function(){
        var payment = $(this).find(".payment input").val();
        if(payment > 0)
        {
            total = parseFloat(Math.round((total-payment) * 100) / 100).toFixed(2);
            var aviableAmountEl = $(this).find(".last input");
            $(aviableAmountEl).val(total);
            $(this).find(".last input").val(total);
            if(total>=0)
            {
                $(aviableAmountEl).css("color","black");
            } else
            {
                $(aviableAmountEl).css("color","red");
                underValue= true;
            }
        }
    });
    if(underValue) alert("Available balance is under 0$");
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
    $("ul.content").append('<li data-id="'+lastRowID+'"> <span class="dater"><input  onchange="dateFormatCheck(this)"></span> <span  class="paid"><input></span> <span class="description"><input></span> <span class="checkRef"><input></span> <span class="payment"><input onchange="priceFormatCheck(this)"></span> <span class="last"><input readonly></span> </li>');
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
    if(!lastSyncOK()) return;
    rowUpdatedID = $(el).parent().parent().attr("data-id");
    db.rowUpdateInsert();
    //db.transaction(dbUpdateQ, errorCB);
}

function startTable(el)
{
    $(el).prop('checked', false);
    var code = $(el).next().html();
    $(".instructions div.pickUp").html("");
    showInstructions(false);

    newWTable();

    $("#code option:contains(" + code + ")").attr('selected', 'selected');
    //$("#code option:selected").text(code);

    //db.transaction(dbUpdateQ, errorCB);
}

function showInstructions(yesnNo)
{
    if(yesnNo)
    {
        // show instructions
        //$("div.topMenu").css("display","none");
        $("div.sheets").css("display","none");
        $("div.instructions").css("display","block");
    } else
    {
        $("div.topMenu").css("display","block");
        $("div.sheets").css("display","block");
        $("div.instructions").css("display","none");
    }

}

function memPrev()
{
    categorySelectPrev = $("#categorySelect option:selected").val();
}

function lastSyncOK()
{
    var state = true;
    if(lastExportDate!=null)
    {
        currentDate = new Date();
        var ar = lastExportDate.split("-");
        d_lastExportDate = new Date(ar[0],ar[1]-1,ar[2],ar[3],ar[4]);
        var oneDay = 24*60*60*1000;
        var diffDays = Math.round(Math.abs((currentDate.getTime() - d_lastExportDate.getTime())/(oneDay)));
        if(diffDays>31)
        {
            Alert('You have used up your "i-Count" Companion for the month. Please synchronize with your Money Manager, or contact KMD "i-Count" Systems');
            state = false;
        }
    }


    firstInsert = true;
    return state;

}

//-------------------------------------------------------------------
// level: 1=INFO, 2=WARNING, 3=ERROR
function logging(str, level) {
            if (level == 1) console.log("INFO:" + str);
            if (level == 2) console.log("WARN:" + str);
            if (level == 3) alert("ERROR:" + str);
};


function StringtoXML(text){
    if (window.ActiveXObject){
        var doc=new ActiveXObject('Microsoft.XMLDOM');
        doc.async='false';
        doc.loadXML(text);
    } else {
        var parser=new DOMParser();
        var doc=parser.parseFromString(text,'text/xml');
    }
    return doc;
}