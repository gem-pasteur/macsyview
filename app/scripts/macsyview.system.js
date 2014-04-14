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
			console.log( "i = ", i , " p = ",p);
			var p_container = $("#"+container);
            console.log(summary[p].length);
			p_container.append('<div id="'+ p +'" style="width:' + summary[p].length + 'px;"></div>'); 
			p_container.append("<h3>"+p+"</h3>");
			for (var g_name in summary[p]){
				var occurence = parseInt(summary[p][g_name]);
				var color = colorMap["empty"];
				if(occurence){
					color = colorMap[p];
				}
				p_container.append('<span id="'+ g_name +'" style="display: inline-block; width:50px;" title="'+ g_name +'"><div style="background-color:' + color + ';">&nbsp;&nbsp;&nbsp;&nbsp;</div><div>' + summary[p][g_name] + '</div></span>');
				p_container.append('&nbsp;');
			}
		}
	};
	
	return {
		draw: draw
	};
}());
