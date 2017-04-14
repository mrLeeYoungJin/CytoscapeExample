'use strict'

class TopoOptions {
	constructor(name) {
	    this.name = name;
	}
	
	getOption() {
		if(this.name === "grid") {
			return gridOptions;
		} else if(this.name === "dagre") {
			return dagreOptions;
		} else if(this.name === "breadthfirst") {
			return bfsOptions;
		} else if(this.name === "preset") {
			return presetOptions;
		} else {
			return nullOptions;
		}
	}
}

var gridOptions = {
	name: 'grid',
	fit: true, // whether to fit the viewport to the graph
	padding: 30, // padding used on fit
	boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
	avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
	avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
	condense: false, // uses all available space on false, uses minimal space on true
	rows: undefined, // force num of rows in the grid
	cols: 10, // force num of columns in the grid
	position: function(node){
		//console.log("======= : ", node.position(), " | ", node.data().deviceOriginId, " | ", node)
		return {row:node._private.data.row+1, col:node._private.data.level+1};
	}, // returns { row, col } for element
	sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
	animate: false, // whether to transition the node positions
	animationDuration: 500, // duration of animation in ms if enabled
	animationEasing: undefined, // easing of animation if enabled
	ready: undefined, // callback on layoutready
	stop: undefined // callback on layoutstop
};

var dagreOptions = {
	name: 'dagre',
	// dagre algo options, uses default value on undefined
	nodeSep: undefined, // the separation between adjacent nodes in the same rank
	edgeSep: undefined, // the separation between adjacent edges in the same rank
	rankSep: undefined, // the separation between adjacent nodes in the same rank
	rankDir: 'LR', // 'TB' for top to bottom flow, 'LR' for left to right
	minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
	edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

	// general layout options
	fit: true, // whether to fit to viewport
	padding: 30, // fit padding
	animate: false, // whether to transition the node positions
	animationDuration: 500, // duration of animation in ms if enabled
	animationEasing: undefined, // easing of animation if enabled
	boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
	ready: function(){}, // on layoutready
	stop: function(){} // on layoutstop
}

var bfsOptions = {
	name: 'breadthfirst',
	directed: true,
	avoidOverlap: true,
	padding: 5,
	spacingFactor : 1.75,
	ready: function(){}, // on layoutready
	stop: function(){} // on layoutstop
}

var presetOptions = {	// postion 수정설정 가능
	name: 'preset',
	positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
	zoom: undefined, // the zoom level to set (prob want fit = false if set)
	pan: undefined, // the pan level to set (prob want fit = false if set)
	fit: true, // whether to fit to viewport
	padding: 30, // padding on fit
	animate: false, // whether to transition the node positions
	animationDuration: 500, // duration of animation in ms if enabled
	animationEasing: undefined, // easing of animation if enabled
	ready: function(){}, // on layoutready
	stop: function(){} // on layoutstop
}

var nullOptions = {
	name: 'null'
}