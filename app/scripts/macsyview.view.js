/*
 * macsyview.view
 * view module for macsyview
 */

/* jslint   browser : true, continue : true,
  devel  : true, indent  : 4,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

/*global $, macsyview, Mustache, console, location, window */

macsyview.view = (function () {
    'use strict';

    var config = {
        viewContainer: "#mainView",
        directory: "#directory",
        homeLink: "#homeLink",
        systemMatchesLinkList: "#systemMatchesLinkList"
    },

        viewContainer = $(config.viewContainer),

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
            $(config.viewContainer + " .txsview-systemmatchtablerow td").click(function (e) {
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
            macsyview.data.load(jsonFile, function () {
                location.hash = "!list:" + macsyview.data.list().macsyviewId;
                $(window).trigger('hashchange');
            });
        },

        displaySelectForm = function () {
            macsyview.data.reset();
            $(config.systemMatchesLinkList).hide();
            displayView('runSelectForm', {});
            $(config.directory).change(fileSelectionHandler);
        },
    
        init = function () {
            $(config.homeLink).click(displaySelectForm);
            $(config.systemMatchesLinkList).click(displaySystemMatches);
            displaySelectForm();
        };
    
    return {
        'config': config,
        'init': init,
        'displaySelectForm': displaySelectForm,
        'displaySystemMatches': displaySystemMatches,
        'displaySystemMatchFileDetail': displaySystemMatchFileDetail
    };

}());