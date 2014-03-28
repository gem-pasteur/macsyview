/*
 * macsyview.utils
 * Ordered view for MacSyView
 */

/* jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

/*global $, macsyview */

macsyview.utils = (function () {
	'use strict';


	/*********************
	 *  Color Picker
	 *********************/
	var ColorPicker = function ColorPicker(){
		this.colorMap = [
		                 "Aqua", 
		                 "Bisque", "Blue", "BlueViolet", "Brown", "BurlyWood", 
		                 "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Crimson", 
		                 "DarkCyan", "DarkGoldenRod", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", 
		                 "DarkOrange", "DarkGoldenRod", "DarkKhaki", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DeepPink", "DodgerBlue", 
		                 "FireBrick", 
		                 "Gold", "GreenYellow", 
		                 "IndianRed",  
		                 "Khaki",
		                 "MediumOrchid", "MediumSeaGreen", 
		                 "Olive", "OliveDrab", "Orange", "OrangeRed", 
		                 "Peru", "Purple", 
		                 "Red",
		                 "SaddleBrown", "Salmon", "SandyBrown", 
		                 "Tomato", 
		                 "Yellow", "YellowGreen" 
		                 ];

		this.defaultColor = "Gainsboro";
		this.pick = function(gene){
			var color = this.defaultColor;
			if(gene.match){
				var key = 0;
				for( var i = 0; i < gene.match.length; i++){
					key += gene.match.charCodeAt(i);
				};
				key %= this.colorMap.length;
				color = this.colorMap[key];
			}
			return color;
		}
	};

	ColorPicker.prototype.setMap = function (colorMap, defaultColor, pick){
		this.colorMap = colorMap;
		this.defaultColor = defaultColor;
		this.pick = pick;
	};
	return {
		colorPicker: new ColorPicker()
	};
}());
