/*
 * macsyview.data
 * data module for macsyview
 */

/* jslint   browser : true, continue : true,
  devel  : true, indent  : 4,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

/*global $, macsyview, FileReader, console */

macsyview.data = (function () {
    'use strict';

    var loadFile,
        load,
        reset,
        list = [];

    reset = function () {
        list = [];
    };
    
    loadFile = function (textFileHandle, loadedCallback) {
        var result = "",
            chunkSize = 20000,
            fileSize = textFileHandle.size;

        function readBlob(file, offset) {
            //console.log("reading file at offset ", offset);
            var stop = offset + chunkSize - 1,
                reader,
                blob;
            if (stop > (fileSize - 1)) {
                stop = fileSize - 1;
            }
            reader = new FileReader();
            // If we use onloadend, we need to check the readyState.
            reader.onloadend = function (evt) {
                if (evt.target.readyState === FileReader.DONE) { // DONE == 2
                    result += evt.target.result;
                    if (stop < fileSize - 1) {
                        offset = offset + chunkSize;
                        evt = null;
                        readBlob(file, offset);
                    } else {
                        loadedCallback(result);
                    }
                }
            };
            blob = file.slice(offset, stop + 1);
            reader.readAsBinaryString(blob);
        }
        readBlob(textFileHandle, 0);
    };

    load = function (jsonFileHandle, callback) {
        loadFile(jsonFileHandle, function (jsonText) {
            var i, j;
            console.log('parsing json begins...');
            list = JSON.parse(jsonText);
            list.macsyviewId = Date.now();
            console.log('parsing json finished!');
            var utils = macsyview.utils;
            var colorPicker = utils.colorPicker;
            for (i = 0; i < list.length; i++) {
                list[i].id = i;
                 for(j = 0; j < list[i].genes.length; j++){
                     var g = list[i].genes[j];
                     var c = colorPicker.pick(g);
                     g.color =  c;
                }
            }
            callback();
        });
    };
    
    return {
        load: load,
        reset: reset,
        list: function () {
            return list;
        }
    };

}());