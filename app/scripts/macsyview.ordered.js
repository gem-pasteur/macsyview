
/*
 * macsyview.orderedview
 * Ordered view for MacSyView
 * requires RaphaelJS + ???
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
			paper_w : 2500,
			y_replicon : 55,
			replicon_offset : 40,
			genes_offset : 20,
			gene_high : 20,
			inter_gene_space : 20,
			gene_infos_container : "#gene_infos",
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
		//in number of pixels
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
		console.log("profile_coverage = ", this.profile_coverage);
	};

	/***************************
	 *      View objects
	 ***************************/


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
	};

	RepliconGrphx.prototype.draw = function draw_replicon(paper){
		var repl_len_in_px = configMap.paper_w - (2 * configMap.replicon_offset);
		var p = $('<p class="replicon_body"></p>').hide().appendTo("body");
		var replicon_color = p.css("background-color");
		p.remove();
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
		var x = this.gene.start + configMap.replicon_offset + configMap.genes_offset;
		var y = configMap.y_replicon - (configMap.gene_high / 2) ; 
		var w = this.gene.length; 
		var h = configMap.gene_high;
		var arrow = paper.rect(x, y, w, h);
		if(!this.gene.match){
			arrow.attr({fill: "white", 
				stroke: "black", 
				"stroke-dasharray": "-", 
				"fill-opacity": 0.5}
			);
		}else{
			var color = $(".gene_" + this.gene.match).css("background-color");
			arrow.attr({fill: color, stroke: "none", "fill-opacity": 0.9});
		};
		return arrow;
	};

	GenesGrphx.prototype.show = function show_gene(){
		var template = $('#gene_infos_Tpl').html();
		var info_html = Mustache.to_html(template, this.gene);
		$(configMap.gene_infos_container).html(info_html);
	};

	GenesGrphx.prototype.hide = function hide_gene(){
		$(configMap.gene_infos_container).html("fly cursor over a gene to display informations");
	};


	var draw = function(json_data, container){
		var replicon = new Replicon(json_data);
		
		configMap.paper_w = replicon.length + (2 * configMap.replicon_offset);
		var paper = Raphael(container, configMap.paper_w, configMap.paper_h );
		
		paper.canvas.style.backgroundColor = '#F00';
		var repliconGrphx = new RepliconGrphx(replicon);
		repliconGrphx.draw(paper);
		
		for (var i = 0; i < repliconGrphx.genes.length; i++ ){
	          var g = repliconGrphx.genes[i];
	          g.arrow = g.draw(paper);
	          g.arrow.mouseover(g.show.bind(g));
	          g.arrow.mouseout(g.hide.bind(g));
	         }
		
	};
	return {
		configMap: configMap,
		draw: draw,
	};
}());


