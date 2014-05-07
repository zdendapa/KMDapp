/*
DB structure:
headerdata - header data of each table
tabledata - first table
tableindex - list of all tables

tables : table1, table2 ...

 */
var database;   // current database

var db = {
    settings: {
        shortName: 'kmd24',
        version: '1.0',
        displayName: 'KMD app',
        maxSize: 655367 // in bytes
    }
};

db.init = function(success_callback)
{
    logging("Db si initiating",1);
    try {
        if (!window.openDatabase) {
            alert('not supported');
        } else {
            database = openDatabase(db.settings.shortName, db.settings.version, db.settings.displayName, db.settings.maxSize);
            logging("Db opened",1);
            generateFile();
        }
    } catch(e) {
        // Error handling code goes here.
        if (e == "INVALID_STATE_ERR") {
            // Version number mismatch.
            logging("Invalid database version",3);
        } else {
            logging("DB initiating Unknown error "+e,3);
        }
        return;
    }

    db.createTables();
};

db.createTables = function()
{
    database.transaction(function(tx)
    {
        //tx.executeSql('DROP TABLE IF EXISTS sheetsheaders');
        //tx.executeSql('DROP TABLE IF EXISTS sheetsdata');

        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsheaders (shid NUMBER,category, code, planSpend TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsdata (shid NUMBER, rowid NUMBER, dater, paid, desc, checkRef, payment TEXT, balance TEXT)');

        database.transaction(function(tx) {
            tx.executeSql('SELECT count(*) as c FROM sqlite_master WHERE type="table" AND name="meta"', [], function(tx, results) {
                if(results.rows.item(0).c == 0)
                {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS meta (openedSheet NUMBER)');

                    database.transaction(function(tx)
                    {
                        tx.executeSql('INSERT INTO meta (openedSheet) VALUES (0)');
                    }, errorCB);

                }
            }, errorCB);
        }, errorCB);



    }, errorCB, db.initSheetsData);
};

// fill up category drop-down, if exist sheets show them, if not create new one
db.initSheetsData = function()
{
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT * FROM sheetsheaders', [], function(tx, results)
        {
            $( "#categorySelect" ).empty();
            len = results.rows.length;
            if(len==0)
            {
                //db.CreateNextTable();
                newWTable();
            }
            else
            {
                //fill up category drop-down
                for (var i=0; i<len; i++){
                    $( "#categorySelect" ).append($("<option></option>").attr("value", results.rows.item(i).shid).text(results.rows.item(i).category));
                }
                // load header and table
                // get last opened sheet shid
                database.transaction(function(tx)
                {
                    tx.executeSql('SELECT openedSheet FROM meta', [], function(tx, results)
                    {
                        $("#categorySelect").val(results.rows.item(0).openedSheet);
                        db.loadSheet();
                    }, errorCB);
                }, errorCB);

            }

        }, errorCB);
    }, errorCB);
};


db.CreateNextTable = function()
{
    logging("CreateNextTable",1);
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT max(shid) as lastshid FROM sheetsheaders', [], function(tx, results)
        {
            var shid;


                shid = Number(results.rows.item(0).lastshid) + 1;
                $( "#categorySelect" ).append($("<option></option>").attr("value", shid).text(""));
                $( "#categorySelect" ).val(shid);

            database.transaction(function(tx){
                tx.executeSql('INSERT INTO sheetsheaders (shid,category, code, planSpend) VALUES ('+Number(shid)+',"", "", "0.00")');
            }, errorCB);

        }, errorCB);
    }, errorCB);
};



db.headerUpdate = function()
{

    database.transaction(function(tx)
    {
        var category = $("#category").val();
        var code = $("#code option:selected").val();
        var planSpend = $("#planSpend").val();
        var shid = shidCurrentGet();
        tx.executeSql('UPDATE sheetsheaders SET category="'+category+'", code="'+code+'", planSpend="'+planSpend+'" WHERE shid="'+shid+'"');
        //tx.executeSql('INSERT INTO headerdata (category, code, planSpend) VALUES ("'+category+'", "'+code+'", '+planSpend+')');
    }, errorCB);
};


db.rowUpdateInsert = function()
{
    logging("rowUpdateInsert",1);
    logging("rowUpdatedID"+rowUpdatedID,1);
    var shid = shidCurrentGet();
    database.transaction(function(tx) {
        tx.executeSql('SELECT * FROM sheetsdata WHERE rowid='+rowUpdatedID+' and shid='+shid, [], function(tx, results) {
            if(results.rows.length == 0)
            {
                dbUpdateOrInsert(tx,"insert");
            } else
            {
                dbUpdateOrInsert(tx,"update");
            }
        }, errorCB);
    }, errorCB);
};

function dbUpdateOrInsert(tx,type) {
    logging("dbUpdateOrInsert: " + type,1)
    //tx.executeSql('CREATE TABLE IF NOT EXISTS tabledata (id unique, data)');
    var el = $('li[data-id|="'+rowUpdatedID+'"]');
    var rowID = $(el).attr("data-id");
    var dater = $(el).find(".dater input").val();
    var paid = $(el).find(".paid input").val();
    var desc = $(el).find(".description input").val();
    var checkRef = $(el).find(".checkRef input").val();
    var payment = $(el).find(".payment input").val();
    var balance = $(el).find(".last input").val();
    var shid = shidCurrentGet();
    //console.log('UPDATE wt'+currentWtable+' SET dater="'+dater+'", paid="'+paid+'", desc="'+desc+'", checkRef="'+checkRef+'", payment='+payment+', balance='+balance+' WHERE rowid='+rowID);
    if(type=="update") tx.executeSql('UPDATE sheetsdata SET dater="'+dater+'", paid="'+paid+'", desc="'+desc+'", checkRef="'+checkRef+'", payment="'+String(payment)+'", balance="'+balance+'" WHERE rowid='+rowID+' and shid='+shid);
    if(type=="insert") tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+shid+','+rowID+', "'+dater+'", "'+paid+'", "'+desc+'", "'+checkRef+'", "'+payment+'", "'+balance+'")');
}

db.loadSheet = function()
{
    var shid = shidCurrentGet();

    database.transaction(function(tx){
        tx.executeSql('SELECT * FROM sheetsheaders WHERE shid="'+shid+'"', [], function(tx, results) {

            $("#category").val(results.rows.item(0).category);
            $("#code" ).val(results.rows.item(0).code);
            //$("#code").val(results.rows.item(0).code);
            $("#planSpend").val(results.rows.item(0).planSpend);

        }, errorCB);
    }, errorCB);

    database.transaction(function(tx){
        tx.executeSql('SELECT * FROM sheetsdata WHERE shid="'+shid+'"', [], function(tx, results) {
                var len = results.rows.length;
                //console.log("tabledata table: " + len + " rows found.");
                $("ul.content").empty();
                lastRowID = 0;
                for (var i=0; i<len; i++){
                    //console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).payment);
                    $("ul.content").append('<li data-id="'+results.rows.item(i).rowid+'"> <span class="dater"><input onchange="dateFormatCheck(this)" value="'+results.rows.item(i).dater+'"></span> <span class="paid"><input value="'+results.rows.item(i).paid+'"></span> <span class="description"><input  value="'+results.rows.item(i).desc+'" onchange="addRowCheck(this)"></span> <span class="checkRef"><input value="'+results.rows.item(i).checkRef+'"></span> <span class="payment"><input onchange="priceFormatCheck(this);recalculateBalance()" value="'+results.rows.item(i).payment+'"></span> <span class="last"><input  value="'+results.rows.item(i).balance+'" readonly></span> </li>');
                    lastRowID = i;
                }
                addRow(0);
            }
            , errorCB);
    }, errorCB);


};

db.getLastSheetIndex = function(success_callback)
{
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT max(shid) FROM sheetsheaders', [], function(tx, results)
        {
            if(results.rows.length == 0)
            {
                success_callback(0);
            } else
            {
                success_callback();
            }
        }, errorCB);

    }, errorCB);
}

db.setOpenedSheet = function()
{
    database.transaction(function(tx)
    {
        var shid = shidCurrentGet();
        tx.executeSql('UPDATE meta SET openedSheet='+shid);
    }, errorCB);
}





function errorCB(err) {
    alert("Error processing SQL: "+err);
    console.log(err);
}










