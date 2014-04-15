
/*
 * macsyview.orderedview
 * Ordered view for MacSyView
 * requires RaphaelJS + jquery + jquery-mousewheel.js
 */

/* jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

/*global $, macsyview */

macsyview.orderedview = (function () {
	'use strict';

	var configMap = {
			paper_h : 250,
			paper_w : null,
			y_replicon : 55,
			replicon_offset : 40, //in px
			genes_offset : 40, //in bp
			gene_high : 30, //in px
			inter_gene_space : 40, //in bp
			gene_infos_container : "#gene_infos",
			ratio_bp_px : 8,
	};


	/***********************
	 *  Business objects
	 ***********************/

	/*************************
	 *        Replicon
	 *************************/
	var Replicon = function Replicon(json_data){
		this.genes = [];
		var genes_number = json_data.genes.length;
		for (var i = 0; i < genes_number; i++){
			this.genes[i] = new Gene(this, json_data.genes[i]);
			if (i != 0){
				this.genes[i].start = this.genes[i-1].start + this.genes[i-1].length + configMap.inter_gene_space;
			}else{
				this.genes[i].start = 0;
			}
		}
		//in number bp
		var last_gene = this.genes[this.genes.length- 1];
		this.length = last_gene.start + last_gene.length + (configMap.genes_offset * 2);
	};

	/*************************
	 *        Gene
	 *************************/

	var Gene = function Gene(replicon, json_gene){
		this.replicon = replicon;
		this.id = json_gene.id;
		this.profile_coverage = json_gene.profile_coverage;
		this.i_eval = json_gene.i_eval;
		this.position = json_gene.position;
		this.length = json_gene.sequence_length;
		this.match = json_gene.match;
		this.start = null;
		this.color = json_gene.color;
	};

	/***************************
	 *      View objects
	 ***************************/

	var drawer = {
			'pan' : {
				'mousedown' : false,
				'startX' : 0,
				'startY' : 0,
			},
			'viewBox' : [],
			'paper' : null,
			'zoom' : 1,
			'container_id': null,
			
	};

	/******************
	 *  RepliconGrphx
	 ******************/
	var RepliconGrphx = function RepliconGrphx(replicon){
		this.graph = null;
		this.replicon = replicon;
		this.genes = [];
		for (var i = 0; i < this.replicon.genes.length; i++){
			this.genes[i] = new GenesGrphx(this, this.replicon.genes[i]);
		};
		//in number of pixels
		this.length = Math.round(this.replicon.length / configMap.ratio_bp_px);
	};

	RepliconGrphx.prototype.draw = function draw_replicon(paper){
		var repl_len_in_px =  this.length ;
		var replicon_color = "#aaa";
		this.graph = paper.set();
		var genome = paper.path(["M, ", configMap.replicon_offset, configMap.y_replicon, 
		                         "h", repl_len_in_px, "a25,5 -1 0,1 0,5h", 
		                         (-1 * (repl_len_in_px)), "a25,5 0 0,1 0,-5z"]).attr({"fill": replicon_color, 
		                        	 "stroke": replicon_color, 
		                        	 "stroke-width":"1"
		                         } );
		this.graph.push(genome);
		for (var i = 0; i < this.genes.length; i++){
			var g = this.genes[i].draw(paper);
			this.graph.push(g);
		};
	};

	/*****************
	 *   GenesGrphx
	 *****************/

	var GenesGrphx = function GenesGrphx(repGrphx, gene){
		this.replicon = repGrphx;
		this.graph = null;
		this.gene = gene;
	};

	GenesGrphx.prototype.draw = function draw_gene(paper){
		var x = ((this.gene.start + configMap.genes_offset) / configMap.ratio_bp_px ) + configMap.replicon_offset;
		var y = configMap.y_replicon - (configMap.gene_high / 2) ; 
		var w = this.gene.length / configMap.ratio_bp_px ; 
		var h = configMap.gene_high;
		var arrow = paper.rect(x, y, w, h);
		if(!this.gene.match){
			arrow.attr({fill: this.gene.color, 
				stroke: "black", 
				"stroke-dasharray": "-", 
				"fill-opacity": 0.5}
			);
		}else{
			arrow.attr({fill: this.gene.color, stroke: "none", "fill-opacity": 0.9});
		};
		return arrow;
	};

	GenesGrphx.prototype.show = function show_gene(){
		var template = $('#gene_infos_Tpl').html();
		var info_html = Mustache.to_html(template, this.gene);
		$(configMap.gene_infos_container).html(info_html);
		$(configMap.gene_infos_container).stop();
		$(configMap.gene_infos_container).fadeIn();
	};

	GenesGrphx.prototype.hide = function hide_gene(){
		$(configMap.gene_infos_container).stop();
		$(configMap.gene_infos_container).fadeOut();
	};


	/********
	 * Pan *
	 ********/

	var startRecord = function startRecord(event){
		drawer.pan.mousedown = true;
		drawer.pan.startX = event.pageX;
		drawer.pan.startY = event.pageY;
	};

	var doPan = function doPan(event){
		if (drawer.pan.mousedown == false) {
			return;
		}
		//compute dx, dy in the document
		drawer.pan.dX = drawer.pan.startX - event.pageX;
		drawer.pan.dY = drawer.pan.startY - event.pageY;

		var x_factor = drawer.viewBox[2] / drawer.paper.width;
		var y_factor = drawer.viewBox[3] / drawer.paper.height;

		drawer.pan.dX *= x_factor;
		drawer.pan.dY *= y_factor;

		drawer.paper.setViewBox(
				drawer.viewBox[0] + drawer.pan.dX,
				drawer.viewBox[1] + drawer.pan.dY,
				drawer.viewBox[2],
				drawer.viewBox[3]);
	}

	var stopRecord = function stopRecord(evt){
		drawer.viewBox[0] += drawer.pan.dX;
		drawer.viewBox[1] += drawer.pan.dY;
		drawer.pan.mousedown = false;
	}

	/********
	 * Zoom *
	 ********/

	/* transforms screen coordinates into paper coordinates */
	function transformEventCoords(container, event) {
		var offset = container.offset();
		return {
			x : event.clientX - offset.left,
			y : event.clientY - offset.top
		};
	}

	function doZoom(coords, factor) {  
		//transform real coordinates into viewBox coordinates
		var x = drawer.viewBox[0] + coords.x / drawer.zoom; 
		var y = drawer.viewBox[1] + coords.y / drawer.zoom;

		if (factor < 0) {
			factor= 0.95;
		}
		else {
			factor = 1.05;
		}

		var z = ((drawer.zoom || 1) * factor) || 1;
		drawer.zoom = z;
		//zoom viewBox dimensions
		drawer.viewBox[2] = Math.round(configMap.paper_w / drawer.zoom);
		drawer.viewBox[3] = Math.round(configMap.paper_h / drawer.zoom);

		//transform coordinates to new viewBox coordinates
		drawer.viewBox[0] = Math.round(x - coords.x / drawer.zoom);
		drawer.viewBox[1] = Math.round(y - coords.y / drawer.zoom);
		drawer.paper.setViewBox.apply(
				drawer.paper, 
				drawer.viewBox);
	}

	/* Event handler for mouse wheel event.   */
	function wheel(event) {
		doZoom(transformEventCoords($('#'+drawer.container_id), event), event.deltaY);        
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;//prevent to scroll the window
	}

	function reset(event) {
		drawer.viewBox = [0, 0, configMap.paper_w, configMap.paper_h];
		drawer.zoom = 1;
		drawer.paper.setViewBox.apply(
				drawer.paper, 
				drawer.viewBox);
	}

	function fit_2_window(event){
		var new_zoom = configMap.paper_w / $('#'+drawer.container_id).width();
		drawer.zoom = new_zoom;
		var nw_viewBox_w = Math.round(configMap.paper_w / drawer.zoom);
		var nw_viewBox_h = Math.round(configMap.paper_h / drawer.zoom);
		
		drawer.viewBox = [0, 0, nw_viewBox_w, nw_viewBox_h];
		drawer.paper.setViewBox.apply(
				drawer.paper, 
				drawer.viewBox);
	}
	
	var draw = function(json_data, container){

        var container_w = $("#"+container).width();
		var container_h = $("#"+container).height();

        var replicon = new Replicon(json_data);
		var repliconGrphx = new RepliconGrphx(replicon);

		configMap.paper_w = repliconGrphx.length + (2 * configMap.replicon_offset);
        if (configMap.paper_w < container_w){
            configMap.paper_w = container_w;
        }
		var paper = Raphael(container, configMap.paper_w, configMap.paper_h );

		drawer.container_id = container;
		drawer.viewBox = [0, 0, configMap.paper_w, configMap.paper_h];
		drawer.paper = paper;

		repliconGrphx.draw(paper);


		for (var i = 0; i < repliconGrphx.genes.length; i++ ){
			var g = repliconGrphx.genes[i];
			g.arrow = g.draw(paper);
			g.arrow.mouseover(g.show.bind(g));
			g.arrow.mouseout(g.hide.bind(g));
		}

		$("#"+container+" :first-child").mousedown(startRecord);
		$("#"+container+" :first-child").mousemove(doPan);
		$("#"+container+" :first-child").mouseup(stopRecord);
		$("#"+container+" :first-child").mousewheel(wheel);
		$('#resetZoom').click(reset);
		$('#fit_2_window').click(fit_2_window);

		/********************************************
		 * replace cursor icon with open/close hand 
		 * when mouse over replicon schema
		 *********************************************/
		$("#"+container).bind("mousedown" , function( evt ){
			$(this).toggleClass( "grabbing" ).toggleClass( "grabbable" );
		}); 
		$("#"+container).bind("mouseup" , function(){
			$(this).toggleClass( "grabbable" ).toggleClass( "grabbing" );
		});
	};
	return {
		configMap: configMap,
		draw: draw,
	};
}());


