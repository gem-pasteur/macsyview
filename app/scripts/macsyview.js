/*jslint plusplus: true */
/*global $, FileReader, Mustache, console, location, window */

var macsyview = (function () {
    'use strict';

    var resetSelectedFiles = function () {
            macsyview.data.reset();
            $('#systemMatchesLinkList').hide();
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
                location.hash = "!detail:" + macsyview.data.list().macsyviewId + ":" + id;
                $(window).trigger('hashchange');
            });
        },
        
        displaySystemMatches = function () {
            displayView('systemMatchesList', {
                'files': macsyview.data.list()
            });
            initSystemMatchSelectionHandler();
        },

        fileSelectionHandler = function (e) {
            var jsonFile = e.target.files[0];
            macsyview.data.load(jsonFile,function(){
                location.hash = "!list:" + macsyview.data.list().macsyviewId;
                $(window).trigger('hashchange');
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
            $(window).bind('hashchange', function (event) {
                var viewName = location.hash.split(":")[0];
                switch (viewName) {
                case "#!select":
                    displaySelectForm();
                    break;
                case "#!list":
                    // control that we are asking for the correct file
                    var macsyviewRequestedId = parseInt(location.hash.split(":")[1]);
                    if (macsyviewRequestedId !== macsyview.data.list().macsyviewId) {
                        location.hash = "!select";
                        $(window).trigger('hashchange');
                    }
                    displaySystemMatches();
                    break;
                case "#!detail":
                    // control that we are asking for the correct file
                    var macsyviewRequestedId = parseInt(location.hash.split(":")[1]);
                    if (macsyviewRequestedId !== macsyview.data.list().macsyviewId) {
                        location.hash = "!select";
                        $(window).trigger('hashchange');
                    }
                    displaySystemMatchFileDetail(macsyview.data.list()[location.hash.split(":")[2]]);
                    break;
                default:
                    location.hash = "!select";
                    $(window).trigger('hashchange');
                }
            });
            $(window).trigger('hashchange');
        };

    return {init: init};
}());