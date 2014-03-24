/*jslint plusplus: true */
/*global $, FileReader, Mustache */

var macsyview = (function () {
    'use strict';

    var matchesList,
        
        resetSelectedFiles = function () {
            matchesList = [];
            $('#systemMatchesLinkList').hide();
        },

        loadFile = function (textFile, loadedCallback) {
            var result = "",
                chunkSize = 20000,
                fileSize = textFile.size;

            function readBlob(file, offset) {
                console.log("reading file at offset ", offset);
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
            readBlob(textFile, 0);
        },

        viewContainer = $("#mainView"),

        displayView = function (viewName, context) {
            viewContainer.html('');
            var template = $('#' + viewName).text();
            viewContainer.html(Mustache.render(template, context));
        },

        displaySystemMatchFileDetail = function (doc) {
            doc.matchedGenes = doc.genes.filter(function (gene) {
                return ('match' in gene);
            });
            displayView('systemMatchDetail', doc);
        },

        initSystemMatchSelectionHandler = function () {
            $(".txsview-systemmatchtablerow td").click(function (e) {
                var id = $(e.currentTarget).parent().attr('data-systemmatchid');
                displaySystemMatchFileDetail(matchesList[id].components);
            });
        },
        
        displaySystemMatches = function () {
            displayView('systemMatchesList', {
                'files': matchesList
            });
            initSystemMatchSelectionHandler();
        },

        fileSelectionHandler = function (e) {
            var jsonFile = e.target.files[0],
                i;
            loadFile(jsonFile, function (jsonText) {
                console.log('parsing json begins...');
                matchesList = JSON.parse(jsonText);
                console.log('parsing json finished!');
                for (i = 0; i < matchesList.length; i++) {
                    matchesList[i].id = i;
                }
                displaySystemMatches();
            });
        },
        
        displaySelectForm = function () {
            resetSelectedFiles();
            displayView('runSelectForm', {});
            $('#directory').change(fileSelectionHandler);
        },

        init = function () {
            $('#homeLink').click(displaySelectForm);
            $('#systemMatchesLinkList').click(displaySystemMatches);
            resetSelectedFiles();
            displaySelectForm();
        };

    return {init: init};
}());