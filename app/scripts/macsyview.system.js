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
			"forbiden" : "red",
			"empty" : "grey"
	};
	
	var presence = ["mandatory", "allowed", "forbiden"];
	
	var draw = function(json_data, container){
		$("#"+container).append("<h2> System "+ json_data.systemName +"</h2>");
		var summary = json_data.summary;
		
		for (var i = 0; i < presence.length ; i++){
			var  p = presence[i];
			console.log( "i = ", i , " p = ",p);
			var p_container = $("#"+container);
			p_container.append('<div id="'+ p +'"></div>'); 
			p_container.append("<h3>"+p+"</h3>");
			for (var g_name in summary[p]){
				var occurence = parseInt(summary[p][g_name]);
				var color = colorMap["empty"];
				if(occurence){
					color = colorMap[p];
				}
				p_container.append('<span id="'+ g_name +'" style="background-color:' + color + '" title="'+ g_name +'">&nbsp;&nbsp;' + summary[p][g_name] + '&nbsp;&nbsp;</span>');
				p_container.append('&nbsp;');
			}
		}
	};
	
	return {
		draw: draw
	};
}());
