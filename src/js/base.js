class Enum {
	constructor() {
	    this.DeviceCtrl = {DeviceAdd:0, DeviceDel:1, EdgeAdd:2, EdgeDel:3, None:-1}
	}
	
	getDeviceCtrl() {
		return this.DeviceCtrl;
	}
}

var ctrlType = new Enum().getDeviceCtrl();
  
function GraphObj() {
	let thisGraph = this;
	
	let selTempSourceDevice = null;
	let nSelDataFunc = -1;	// 0:Device add, 1:Device del, 2:edge add, 3:edge del
	let newDeviceIdx = 1;
	
	thisGraph.setNSelDataFunc = function(nSelDataFunc2) {
		nSelDataFunc = nSelDataFunc2;
	};
	
	thisGraph.getNSelDataFunc = function() {
		return nSelDataFunc;
	};
	
	thisGraph.getSelTempSourceDevice = function() {
		return selTempSourceDevice;
	};
	
	var deviceInfoInIt = function(device) {
		$("#DeviceOriginId").val(device.DeviceOriginId);
		//$("#DeviceId").val(null);
		$("#Status").val(null);
		$("#Type").val(null);
		$("#EquipType").val(null);
		$("#BaseVoltVal").val(null);
	}
	
	thisGraph.dataSelFunc = function(evtNum, event) {
		var evtTarget = null;
		
		if(event != null) {
			evtTarget = event.target._private;
		}
		
		switch(evtNum) {
			case 0:	// Device add
				let addDevice = {
		    		  group: "nodes",
		    		  data: addDeviceData(),
		    		  position: { x: event.position.x, y: event.position.y }
		    	}
				cy.add(addDevice);
				
				cy.$("#"+addDevice.data.id).select();
				deviceInfoInIt(addDevice.data);
		    	nSelDataFunc = ctrlType.None;
		        break;
		    case 1: // Device del
		    	if(selTempSourceDevice != null) {
		    		if(selTempSourceDevice.target.isNode()) selTempSourceDevice.target.remove();
		    	}
		    	selTempSourceDevice = null;
		    	nSelDataFunc = ctrlType.None;
		        break;
		    case 2:	// edge add
		    	if(selTempSourceDevice != null && selTempSourceDevice.target !== cy) {
		    		let device = selTempSourceDevice.target._private.data;
		    		if(device.id != evtTarget.data.id) {
			    		let linkCheck = false;
			    		cy.edges().forEach(function(l) {
	                		if((l._private.data.source === device.id && l._private.data.target === evtTarget.data.id)
	                				|| (l._private.data.source === evtTarget.data.id && l._private.data.target === device.id)) {
	                			linkCheck = true;
	                			return;
	                		}
	                	});
	                	
	                	if(linkCheck) return;
			    		
			    		cy.add({
				    		  group: "edges",
				    		  data: {source: device.id, target:evtTarget.data.id}
				    	});
			    		selTempSourceDevice = null;
			    	}
		    	} else {
		    		selTempSourceDevice = event;
		    	}
		    	nSelDataFunc = ctrlType.None;
		        break;
		    case 3: // edge del
		    	if(selTempSourceDevice != null) {
		    		if(selTempSourceDevice.target.isEdge()) selTempSourceDevice.target.remove();	
		    	}
		    	selTempSourceDevice = null;
		    	nSelDataFunc = ctrlType.None;
		        break;
		    default:
		    	selTempSourceDevice = event;
		    	nSelDataFunc = ctrlType.None;
		        break;
		}
		
		$('html,body').css('cursor', 'default');
	};
	
	thisGraph.upFeederCheck = function() {
		let feeders = selTempSourceDevice.target;
		if(feeders.length > 1) return;
		
		let feederDevice = feeders[0]._private;
		if(feederDevice.group === "edges") return;
		
		let data = cy.edges("[target=\""+feederDevice.data.id+"\"]")[0];
		
		data.select();
		cy.$("#"+data._private.data.source).select();
		data.ancestors().forEach(function(n){
			cy.$("#"+n.data('source')).select();
			n.select();
		});
	};
	
	thisGraph.topoMenu = function(num) {
		switch (num) {
		case ctrlType.DeviceAdd:
			this.setNSelDataFunc(num);
			$('html,body').css('cursor', 'pointer');
			break;
		case ctrlType.DeviceDel:
			this.dataSelFunc(num);
			break;
		case ctrlType.EdgeAdd:
			this.setNSelDataFunc(num);
			$('html,body').css('cursor', 'pointer');
			break;
		case ctrlType.EdgeDel:
			this.dataSelFunc(num);
			break;
		default:
			break;
		}
	}
	
	thisGraph.downFeederCheck = function() {
		let feeders = selTempSourceDevice.target;
		if(feeders.length > 1) return;
		
		let feederDevice = feeders[0]._private;  
		if(feederDevice.group === "edges") return;
		
		downDeviceCheck(cy.edges("[source=\""+feederDevice.data.id+"\"]"));
	};
	
	var downDeviceCheck = function(device) {
		device.forEach(function(n) {
			n.select();
			cy.$("#"+n.data('target')).select();
			downDeviceCheck(cy.edges("[source=\""+n._private.data.target+"\"]"));
		});
	};
	
	var addDeviceData = function() {
		let device = {
        		id:"newDevice"+newDeviceIdx, 
        		DeviceOriginId:"newLabel"+newDeviceIdx,
        		faveShape: "ellipse"
        }
		
		newDeviceIdx++;
		return device;
	};
};

$(function(){ // on dom ready
	var graphObj = new GraphObj();
	
	var options = {
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
				  return {row:node._private.data.row+1, col:node._private.data.level+1};
				  
			  }, // returns { row, col } for element
			  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
			  animate: false, // whether to transition the node positions
			  animationDuration: 500, // duration of animation in ms if enabled
			  animationEasing: undefined, // easing of animation if enabled
			  ready: undefined, // callback on layoutready
			  stop: undefined // callback on layoutstop
			};
	
	/*var options = {
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
	}*/
	
	
	var cy = cytoscape({
		container: document.getElementById('cy'),
		pan: { x: 0, y: 0 },

		// interaction options:
		minZoom: 0.1,
		maxZoom: 3,
		userZoomingEnabled: true,
	
		style: cytoscape.stylesheet()
			.selector('node')
			.css({
				'shape': 'data(faveShape)',
				'width': '60px',
		        'height': '60px',
		        'content': 'data(deviceOriginId)',
		        'border-width': 5,
		        'border-color': '#61bffc',
		        "text-valign":"center",
		        "text-halign":"center",
		        "background-color":"#555",
		        "text-outline-color":"#555",
		        "text-outline-width":"2px",
		        "color":"#fff",
		        "overlay-padding":"6px",
		        "z-index":"10"
			})
		    .selector('edge')
		    .css({
		        'width': 4,
		        'target-arrow-shape': 'triangle',
		        'opacity': 0.5,
		        'curve-style': 'bezier'
		    })
		    .selector(':selected')
		    .css({
		        'background-color': 'red',
		        'line-color': 'red',
		        'target-arrow-color': 'red',
		        'source-arrow-color': 'red',
		        'opacity': 1
		    })
		    .selector('.faded')
		    .css({
		        'opacity': 0.25,
		        'text-opacity': 0
		}),
		  
		elements: dataElements,
		  
		/*layout: {
			name: 'breadthfirst',
			directed: true,
			avoidOverlap: true,
			padding: 5,
			spacingFactor : 1.75
		},*/
		
		/*layout: {
			name: 'preset',

			  positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
			  zoom: undefined, // the zoom level to set (prob want fit = false if set)
			  pan: undefined, // the pan level to set (prob want fit = false if set)
			  fit: true, // whether to fit to viewport
			  padding: 130, // padding on fit
			  animate: false, // whether to transition the node positions
			  animationDuration: 500, // duration of animation in ms if enabled
			  animationEasing: undefined, // easing of animation if enabled
			  ready: undefined, // callback on layoutready
			  stop: undefined // callback on layoutstop
		},*/
		  
		ready: function(){
			window.cy = this;
		}
	});
	 
	cy.zoom({
		level: 0.1, // the zoom level
		renderedPosition: { x: 0, y: 0 }
	});
	
	$("#nodeAdd").click(function() {
		graphObj.topoMenu(ctrlType.DeviceAdd);
	});
	$("#nodeDel").click(function() {
		graphObj.topoMenu(ctrlType.DeviceDel);
	});
	$("#EdgeAdd").click(function() {
		graphObj.topoMenu(ctrlType.EdgeAdd);
	});
	$("#EdgeDel").click(function() {
		graphObj.topoMenu(ctrlType.EdgeDel);
	});
	 
	cy.on('tap', function(event) {
		var evtTarget = event.target;
		  
		if( evtTarget === cy ){
			//console.log('tap on background : ', evtTarget);
			cy.$(':selected').unselect();
			if(graphObj.getNSelDataFunc() != 0) graphObj.setNSelDataFunc(-1);
		} else {
			//console.log('tap on some element : ', evtTarget);
			if(evtTarget._private.group === "nodes") {
				$("#DeviceOriginId").val(evtTarget._private.data.deviceOriginId);
				//$("#DeviceId").val(evtTarget._private.data.id);
				$("#Status").val(evtTarget._private.data.statusCd);
				$("#Type").val(evtTarget._private.data.typeCd);
				$("#EquipType").val(evtTarget._private.data.equipCd);
				$("#BaseVoltVal").val(evtTarget._private.data.baseVoltVal);
			}
		}
		  
		graphObj.dataSelFunc(graphObj.getNSelDataFunc(), event);
	});
	
	$("#upFeeder").click(function() {
		graphObj.upFeederCheck();
	});
	
	$("#downFeeder").click(function() {
		graphObj.downFeederCheck();
	});
	
	$("#upDownFeeder").click(function() {
		graphObj.upFeederCheck();
		graphObj.downFeederCheck();
	});
	
	 /*cy.nodes().forEach(function(n){
		    var g = n.data('name');

		    console.log("====g : ", n);
		    n.qtip({
		      content: [
		        {
		          name: g,
		          url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
		        }
		      ].map(function( link ){
		        return '<a target="_blank" href="' + link.url + '">' + link.name + '</a>';
		      }).join('<br />\n'),
		      position: {
		        my: 'bottom center',
		        at: 'top center'
		      },
		      style: {
		        classes: 'qtip-bootstrap',
		        tip: {
		          width: 16,
		          height: 8
		        }
		      }
		    });
		  });*/
	 

	cy.on('mouseover', 'node', function (evt) {
        $('html,body').css('cursor', 'pointer');
    });
	cy.on('mouseout ', 'node', function (evt) {
        $('html,body').css('cursor', 'default');
    });
	
	$('#config-toggle').on('click', function(){
		$('body').toggleClass('config-closed');
		cy.resize();
	});
	
	cy.layout( options ).run();
}); // on dom ready

$(function() {
	FastClick.attach( document.body );
});