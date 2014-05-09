/*
1. get date of last modification
    if same like in db - export db (and save new modification date to dob)
    if not same like in db - load whole data (and save new modification date)
 */

var fs = null;		// filesystem
var dir = null;		// dir
var xmlString = "";

function fileInit()
{
    //initFs();


    generateXML();
}

function initFs() {
    var s = location.origin + location.pathname;
    var pi = s.lastIndexOf("/");
    s = s.substring(0,pi);
    appBaseURL = s.substring(0, pi + 1);
    console.log("appBaseURL:" + appBaseURL);

    if (is_cordova()) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, onError);
    } else {
        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.webkitStorageInfo.TEMPORARY, 5*1024*1024, gotFileSystem, onError);
    }
}

function gotFileSystem(lfs) {
    fs = lfs;
    fs.root.getDirectory('kmd', {create: true, exclusive: false}, gotDirectory, onError);
}
function gotDirectory(ldir) {
    dir = ldir;
    //dir.getFile("kmdExport.txt", {create: true}, gotFileEntry);
    workOn(dir,"meta");

}

function doReadFile(e) {
    fileSystem.root.getFile("TMMHExport.txt", {create:false}, readFile, onError);
}

function workOn(dir,type) {
    // get modification date of file for recognize software update
    if(type=="meta")
    {
        dir.getFile("TMMHExport.txt", {create:false}, function(f) {
            f.getMetadata(metadataFile,onError);
        },noFile);
    }
    // after write, read modification date
    if(type=="metaSave")
    {
        dir.getFile("TMMHExport.txt", {create:false}, function(f) {
            f.getMetadata(metadataFileSave,onError);
        }, onError);
    }
    if(type=="write")
    {
        dir.getFile("TMMHExport.txt", {create:true}, writeFile, onError);
    }
    if(type=="read")
    {
        dir.getFile("TMMHExport.txt", {create:false}, readFile, onError);
    }

}

function noFile()
{
    db.sheetsdataRowsCount(function(){
        if(db.sheetsdataRowsCountNum>0) workOn(dir,"write");
    });
}

function metadataFile(m) {
    //alert("File was last modified "+m.modificationTime);
    modificationDate = new Date(m.modificationTime);
    db.readLastExport(importExport);
    //db.setLastExport();
    //workOn(dir,"write");
}
function metadataFileSave(m) {
    //alert("File was last modified "+m.modificationTime);
    modificationDate = new Date(m.modificationTime);
    db.setLastExport();
    //workOn(dir,"write");
}

var importExport = function ()
{

    var d_modificationDate = String(modificationDate.getFullYear()) + "-" + String(modificationDate.getMonth()+1) + "-" + modificationDate.getDate() + "-" + modificationDate.getHours() + "-" + modificationDate.getMinutes();

    logging("modificationDate of file: " + d_modificationDate, 1);
    logging("lastExportDate of file: " + lastExportDate, 1);
    if(lastExportDate==d_modificationDate)
    {
        logging("Dates are same, start to export data", 1);
        //workOn(dir,"write");
        workOn(dir,"read");

    }else
    {
        //export data from db
        logging("Dates are not same, modification by software occured, start to read data", 1);
        workOn(dir,"read");
    }
    return;
}


/*
<data>
    <meta>
        <category>
             <option>4006 "Auto Expenses"</option>
             <option>4007 "Food/Sundries"</option>
             <option>4008 "Home Maintenance"</option>
             <option>4009 "Insurance"</option>
             <option>4010 "Medical"</option>
             <option>4011 "Housing"</option>
             <option>4012 "Telephone"</option>
             <option>4013 "Utilities"</option>
             <option>4014 "Open"</option>
             <option>4015 "Open"</option>
             <option>4016 "Unident ified Cash w/d"</option>
             <option>4017 "Open"</option>
             <option>4018 "Open"</option>
             <option>4019 "Oenn</option>
             <option>4020 "Open"</option>
             <option>4021 "Open"</option>
             <option>4517 "Child#1-A"</option>
             <option>4517 "Child#2-B"</option>
             <option>4517 "Child#3-C"</option>
             <option>4517 "Child#4-D"</option>
             <option>4517 "Child#5-E"</option>
             <option>4518 "for Primary Wage Earner #1"</option>
             <option>4519 "for Primary Wage Earner #2"</option>
             <option>4520 "Pet#1-A"</option>
             <option>4520 "Pet#2-B"</option>
             <option>4521 "Open"</option>
             <option>5023 "Medical Debt / Fees / Charges"</option>
             <option>5024 "Loans & Notes Payable"</option>
             <option>5025 "Tax Debt I Estimated Tax"</option>
             <option>5026 "Open"</option>
             <option>6028 "Donations/Gifts"</option>
             <option>6029 "Entertainment"</option>
             <option>6032 "Savings"</option>
             <option>6033 "Vacations"</option>
        </category>
     </meta>
 </data>
*/

function readFile(fileEntry)
{
    fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
            var xml = StringtoXML(this.result);
            var options = xml.getElementsByTagName("option");
            if(options.length>2)
            {
                $( "#code" ).empty();
                for (var i = 0; i < options.length; i++) {
                    var option = options[i].firstChild.nodeValue;
                    $( "#code" ).append($("<option></option>").attr("value", option).text(option));
                }
            }


        };
        reader.readAsText(file);
    });
}

function writeFile(fileEntry)
{
    fileEntry.createWriter(gotFileWriter);
}

function gotFileWriter(writer) {
    writer.onwrite = function(evt) {
        logging("write success",1);
        workOn(dir,"metaSave");
    };


    if(workLocal)
    {
        //var blob = new Blob([xmlString], {type: "text/plain"});
        var blob = new Blob(['<data>  <meta>  <category>  <option>4006 "Auto Expenses"</option>  <option>4007 "Food/Sundries"</option>  <option>4008 "Home Maintenance"</option>  <option>4009 "Insurance"</option>  <option>4010 "Medical"</option>  <option>4011 "Housing"</option>  <option>4012 "Telephone"</option>  <option>4013 "Utilities"</option>  <option>4014 "Open"</option>  <option>4015 "Open"</option>  <option>4016 "Unident ified Cash w/d"</option>  <option>4017 "Open"</option>  <option>4018 "Open"</option>  <option>4019 "Oenn</option>  <option>4020 "Open"</option>  <option>4021 "Open"</option>  <option>4517 "Child#1-A"</option>  <option>4517 "Child#2-B"</option>  <option>4517 "Child#3-C"</option>  <option>4517 "Child#4-D"</option>  <option>4517 "Child#5-E"</option>  <option>4518 "for Primary Wage Earner #1"</option>  <option>4519 "for Primary Wage Earner #2"</option>  <option>4520 "Pet#1-A"</option>  <option>4520 "Pet#2-B"</option>  <option>4521 "Open"</option>  <option>5023 "Medical Debt / Fees / Charges"</option>  <option>5024 "Loans &amp; Notes Payable"</option>  <option>5025 "Tax Debt I Estimated Tax"</option>  <option>5026 "Open"</option>  <option>6028 "Donations/Gifts"</option>  <option>6029 "Entertainment"</option>  <option>6032 "Savings"</option>  <option>6033 "Vacations"</option>  </category>  </meta>  </data>'], {type: "text/plain"});
        writer.write(blob);
    } else
    {
        //alert("start store file, wait for success");
        writer.write(xmlString);
        //writer.write('<data>  <meta>  <category>  <option>4006 "Auto Expenses"</option>  <option>4007 "Food/Sundries"</option>  <option>4008 "Home Maintenance"</option>  <option>4009 "Insurance"</option>  <option>4010 "Medical"</option>  <option>4011 "Housing"</option>  <option>4012 "Telephone"</option>  <option>4013 "Utilities"</option>  <option>4014 "Open"</option>  <option>4015 "Open"</option>  <option>4016 "Unident ified Cash w/d"</option>  <option>4017 "Open"</option>  <option>4018 "Open"</option>  <option>4019 "Oenn</option>  <option>4020 "Open"</option>  <option>4021 "Open"</option>  <option>4517 "Child#1-A"</option>  <option>4517 "Child#2-B"</option>  <option>4517 "Child#3-C"</option>  <option>4517 "Child#4-D"</option>  <option>4517 "Child#5-E"</option>  <option>4518 "for Primary Wage Earner #1"</option>  <option>4519 "for Primary Wage Earner #2"</option>  <option>4520 "Pet#1-A"</option>  <option>4520 "Pet#2-B"</option>  <option>4521 "Open"</option>  <option>5023 "Medical Debt / Fees / Charges"</option>  <option>5024 "Loans & Notes Payable"</option>  <option>5025 "Tax Debt I Estimated Tax"</option>  <option>5026 "Open"</option>  <option>6028 "Donations/Gifts"</option>  <option>6029 "Entertainment"</option>  <option>6032 "Savings"</option>  <option>6033 "Vacations"</option>  </category>  </meta>  </data>');





        //alert("the file was stored at:" + appBaseURL + "\\kmd\\kmdTest1.txt");
        writer.abort();
        // contents of file now 'some different text'
    }

}

function generateXML()
{
    database.transaction(function(tx)
    {
        tx.executeSql('select * from sheetsdata JOIN sheetsheaders ON sheetsdata.shid=sheetsheaders.shid', [], function(tx, results)
        {
            len = results.rows.length;
            if(len==0)
            {
                xmlString = "no data in db";
            }
            else
            {


/*
             <?xml version="1.0"?>
            <data>
                <meta>
                    <category>
                        <option>4006 "Auto Expenses"</option>
                        <option>4007 "Food/Sundries"</option>
                        <option>4008 "Home Maintenance"</option>
                        <option>4009 "Insurance"</option>
                        <option>4010 "Medical"</option>
                        <option>4011 "Housing"</option>
                        <option>4012 "Telephone"</option>
                        <option>4013 "Utilities"</option>
                        <option>4014 "Open"</option>
                        <option>4015 "Open"</option>
                        <option>4016 "Unident ified Cash w/d"</option>
                        <option>4017 "Open"</option>
                        <option>4018 "Open"</option>
                        <option>4019 "Oenn</option>
                        <option>4020 "Open"</option>
                        <option>4021 "Open"</option>
                        <option>4517 "Child#1-A"</option>
                        <option>4517 "Child#2-B"</option>
                        <option>4517 "Child#3-C"</option>
                        <option>4517 "Child#4-D"</option>
                        <option>4517 "Child#5-E"</option>
                        <option>4518 "for Primary Wage Earner #1"</option>
                        <option>4519 "for Primary Wage Earner #2"</option>
                        <option>4520 "Pet#1-A"</option>
                        <option>4520 "Pet#2-B"</option>
                        <option>4521 "Open"</option>
                        <option>5023 "Medical Debt / Fees / Charges"</option>
                        <option>5024 "Loans & Notes Payable"</option>
                        <option>5025 "Tax Debt I Estimated Tax"</option>
                        <option>5026 "Open"</option>
                        <option>6028 "Donations/Gifts"</option>
                        <option>6029 "Entertainment"</option>
                        <option>6032 "Savings"</option>
                        <option>6033 "Vacations"</option>
                    </category>
                </meta>
                <sheet>
                    <header>
                         <category></category>
                         <planSpend></planSpend>
                         <code></code>
                    </header>
                    <tableData>
                        <date></date>
                         <paid></paid>
                         <desc></desc>
                         <ref></ref>
                         <payment></payment>
                         <available></available>
                    <tableData>
                </sheet>
            </data>

             */


                xmlString = "<data>";
                var shid = "";
                var shidBefore = false;
                //fill up category drop-down
                for (var i=0; i<len; i++){
                    if(results.rows.item(i).shid!=shid)
                    {
                        if(shidBefore)
                        {
                            xmlString += "</tableData></sheet>";
                        }
                        xmlString += "<sheet><header><category>" + results.rows.item(i).category + "</category><planSpend>"+results.rows.item(i).planSpend+"</planSpend><code>"+results.rows.item(i).code+"</code></header><tableData>";
                        shidBefore = true;
                    }
                    xmlString += "<date>"+results.rows.item(i).dater+"</date><paid>"+results.rows.item(i).paid+"</paid><desc>"+results.rows.item(i).desc+"</desc><ref>"+results.rows.item(i).checkRef+"</ref>"
                    xmlString += "<payment>"+results.rows.item(i).payment+"</payment><available>"+results.rows.item(i).balance+"</available>";
                }
                xmlString += "</tableData></sheet></data>";
            }

            initFs();

        }, errorCB);
    }, errorCB);
}











function generateFile()
{
    if(db.sheetsdataRowsCountNum>0) fileInit();
}


// chyba pri inicializaci filesystemu
function onError(e) {
    alert("chyba:" + e);
}

// chyba pri nacitani obrazku
function error_callback(e) {
    alert("chyba:" + e);
}


var is_cordova = function() {
    return (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
};

/*

function fileInit()
{


    ImgCache.options.debug = true;
    ImgCache.options.usePersistentCache = true;
    ImgCache.options.chromeQuota = 50*1024*1024;

    //console.log("cacheInit");

    ImgCache.init(function(){
        console.log('cache space ready');
        //cacheListShaFileNameGet();
        cachePreffix=ImgCache.getCacheFolderURI();
        test();
    }, function(){
        alert('cache problem');
        console.log('cache space problem!');
        //init();
    });
}

function test()
{
    //ImgCache.clearCache();
    //http://www.intelligrape.com/images/logo.png
    //ImgCache.cacheFile("http://www.intelligrape.com/images/logo.png", function(){

    //cacheFile
return;
    ImgCache.read("http://www.urias.cz/tmp/t.txt", function(){
        ImgCache.useCachedFile(target);
        console.log("cached");
    });
}

    */