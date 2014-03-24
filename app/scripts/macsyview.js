/*jslint plusplus: true */
/*global $, FileReader, Mustache */

var macsyview = (function () {
    'use strict';

    var selectedSystemMatchFiles = null,

        resetSelectedFiles = function () {
            selectedSystemMatchFiles = null;
            $('#systemMatchesLinkList').hide();
        },

        setSelectedSystemMatchFiles = function (filesList) {
            selectedSystemMatchFiles = filesList;
            $('#systemMatchesLinkList').show();
        },

        loadFile = function (textFile, loadedCallback) {
            var result = "",
                chunkSize = 20000,
                fileSize = textFile.size;

            function readBlob(file, offset) {
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

        listSystemMatchFiles = function (files) {
            var systemMatchRE = /([A-Za-z0-9]+)_([A-Za-z0-9]+)_([A-Za-z0-9]+)\.sfmatch\.json/,
                systemMatchFiles = [],
                i,
                len,
                match;
            for (i = 0, len = files.length; i < len; i++) {
                match = systemMatchRE.exec(files[i].name);
                if (match) {
                    systemMatchFiles.push({
                        'file': files[i],
                        'replicon_name': match[1],
                        'system_name': match[2],
                        'occurence_number': match[3],
                        'id': files[i].name
                    });
                }
            }
            return systemMatchFiles;
        },

        viewContainer = $("#mainView"),

        displayView = function (viewName, context) {
            viewContainer.html('');
            var template = $('#' + viewName).text();
            viewContainer.html(Mustache.render(template, context));
        },

        displaySystemMatchFileDetail = function (systemMatch) {
            loadFile(systemMatch.file, function (contentsText) {
                var doc = JSON.parse(contentsText);
                doc.matchedGenes = doc.genes.filter(function (gene) {
                    return ('match' in gene);
                });
                displayView('systemMatchDetail', doc);
            });
        },

        initSystemMatchSelectionHandler = function () {
            $(".txsview-systemmatchtablerow td").click(function (e) {
                var id = $(e.currentTarget).parent().attr('data-systemmatchid'),
                    selectedSystemMatchFile = selectedSystemMatchFiles.filter(function (systemMatchFile) {
                        return systemMatchFile.id === id;
                    })[0];
                displaySystemMatchFileDetail(selectedSystemMatchFile);
            });
        },
        
        displaySystemMatches = function () {
            displayView('systemMatchesList', {
                'files': selectedSystemMatchFiles
            });
            initSystemMatchSelectionHandler();
        },
    
        directorySelectionHandler = function (e) {
            var files = e.target.files;
            setSelectedSystemMatchFiles(listSystemMatchFiles(files));
            displaySystemMatches();
        },

        
        displaySelectForm = function () {
            resetSelectedFiles();
            displayView('runSelectForm', {});
            $('#directory').change(directorySelectionHandler);
        },

        init = function () {
            $('#homeLink').click(displaySelectForm);
            $('#systemMatchesLinkList').click(displaySystemMatches);
            resetSelectedFiles();
            displaySelectForm();
        };

    return {init: init};
}());