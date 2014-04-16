/*
 * macsyview.system
 * System view for MacSyView
 * requires RaphaelJS + jquery + jquery-mousewheel.js
 */

/* jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

/*global $, macsyview */

macsyview.system = (function () {
	'use strict';

	var colorMap = {
			"mandatory" : "green",
			"allowed" : "blue",
			"forbidden" : "red",
			"empty" : "grey"
	};
	
	var presence = ["mandatory", "allowed", "forbidden"];
	
	var draw = function(json_data, container){
		var summary = json_data.summary;
		
		for (var i = 0; i < presence.length ; i++){
			var  p = presence[i];
			var p_container = $("#"+container);
			p_container.append('<div id="'+ p +'" style="width:' + summary[p].length + 'px;"></div>'); 
			p_container.append("<h3>"+p+"</h3>");
            // sort alphabetically by gene name
            summary[p].sort(function(gene1, gene2){
                return gene1.name.localeCompare(gene2.name);
            });
            $.each(summary[p], function(index, gene){
				var occurence = parseInt(gene.value);
				p_container.append('<span id="'+ gene.name +'" style="display: inline-block; width:50px;" title="'+ gene.name +'"><div style="background-color:' + gene.color + ';">&nbsp;&nbsp;&nbsp;&nbsp;</div><div>' + occurence + '</div></span>');
				p_container.append('&nbsp;');
            });
		}
	};
	
	return {
		draw: draw
	};
}());
