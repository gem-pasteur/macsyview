/*jslint plusplus: true */
/*global $, FileReader, Mustache, console, location, window */

var macsyview = (function () {
    'use strict';

    var go = function (hashString) {
        location.hash = "!" + hashString;
        $(window).trigger('hashchange');
    },

        checkDataId = function () {
            // control that we are asking for the correct file
            var macsyviewRequestedId = parseInt(location.hash.split(":")[1], 10);
            if (macsyviewRequestedId !== macsyview.data.list().macsyviewId) {
                go('select');
                return false;
            } else {
                return true;
            }
        },
        
        init = function () {
            macsyview.view.init();
            $(window).bind('hashchange', function (event) {
                var viewName = location.hash.split(":")[0];
                switch (viewName) {
                case "#!select":
                    macsyview.view.displaySelectForm();
                    break;
                case "#!list":
                    checkDataId();
                    switch(location.hash.split(":")[2]){
                        case "by_system":
                            macsyview.view.displaySystemMatches(['systemName', 'repliconName', 'occurencesNumber']);
                            break;
                        case "by_replicon":
                        default:
                            macsyview.view.displaySystemMatches(['repliconName', 'systemName', 'occurencesNumber']);  
                            break;
                    }
                    break;
                case "#!detail":
                    checkDataId();
                    macsyview.view.displaySystemMatchFileDetail(macsyview.data.list()[location.hash.split(":")[2]]);
                    break;
                default:
                    go('select');
                }
            });
            $(window).trigger('hashchange');
        };

    return {
        init: init,
        go: go
    };
}());