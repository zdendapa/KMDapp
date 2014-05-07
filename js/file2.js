
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
    dir.getFile("kmdTest1.txt", {create: true}, gotFileEntry);

}

function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter);
}

function gotFileWriter(writer) {
    writer.onwrite = function(evt) {
        console.log("write success");
    };

    alert("start store file, wait for success");
    writer.write(xmlString);
    alert("the file was stored at:" + appBaseURL + "\kmd\kmdTest1.txt");
    writer.abort();
    // contents of file now 'some different text'
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


/*
             <?xml version="1.0"?>
            <data>
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









function generateFile()
{
    //fileInit();
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