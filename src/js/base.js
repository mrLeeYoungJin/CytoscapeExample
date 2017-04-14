class Enum {
	constructor() {
	    this.DeviceCtrl = {DeviceAdd:0, DeviceDel:1, EdgeAdd:2, EdgeDel:3, None:-1}
	}
	
	static DeviceCtrl() {
		return this.DeviceCtrl;
	}
}

var ctrlType = new Enum().DeviceCtrl;

const TopoClass =(() => {
	let defaultNodeClass = {
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
	}
	
	let defaultEdgeClass = {
	    'width': 4,
        'target-arrow-shape': 'triangle',
        'opacity': 0.5,
        'curve-style': 'bezier'
    }
	
	let defaultSelectClass = {
        'background-color': 'red',
        'line-color': 'red',
        'target-arrow-color': 'red',
        'source-arrow-color': 'red',
        'opacity': 1
    }
	
	class TopoClass {
		constructor(_nodeClass, _edgeClass, _selectClass) {
			let nodeClass = _nodeClass || defaultNodeClass; 
			let edgeClass = _edgeClass || defaultEdgeClass;
			let selectClass = _selectClass || defaultSelectClass;
			
			this.getNodeClass = function() {return nodeClass;}
			this.setNodeClass = function(value){nodeClass = value;}
			
			this.getEdgeClass = function() {return edgeClass;}
			this.setEdgeClass = function(value){edgeClass = value;}
			
			this.getSelectClass = function() {return selectClass;}
			this.setSelectClass = function(value){selectClass = value;}
		}
	}
	return TopoClass;
})();

function GraphObj() {
	let thisGraph = this;
	
	let layoutOption = "preset";
	let selTempSourceDevice = null;
	let nSelDataFunc = -1;	// 0:Device add, 1:Device del, 2:edge add, 3:edge del
	let newDeviceIdx = 1;
	
	thisGraph.getLayoutOption = function() {
		return layoutOption;
	};
	
	thisGraph.setNSelDataFunc = function(nSelDataFunc2) {
		nSelDataFunc = nSelDataFunc2;
	};
	
	thisGraph.getNSelDataFunc = function() {
		return nSelDataFunc;
	};
	
	thisGraph.getSelTempSourceDevice = function() {
		return selTempSourceDevice;
	};
	
	thisGraph.deviceInfoInIt = function(device) {
		$("#DeviceOriginId").val(device.deviceOriginId);
		//$("#DeviceId").val(null);
		$("#Status").val(null);
		$("#Type").val(null);
		$("#EquipType").val(null);
		$("#BaseVoltVal").val(null);
	}
	
	thisGraph.dataSelFunc = function(evtNum, event) {
		var evtTarget = null;
		
		if(event != null) {
			evtTarget = event.target;
		}
		
		switch(evtNum) {
			case 0:	// Device add
				let addDevice = {
		    		  group: "nodes",
		    		  data: addDeviceData(),
		    		  position: { x: event.position.x, y: event.position.y },
					  style : {"background-color":"gray",}
		    	}
				cy.add(addDevice);
				
				cy.$("#"+addDevice.data.id).select();
				this.deviceInfoInIt(addDevice.data);
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
		    		let device = selTempSourceDevice.target.data();
		    		if(device.id != evtTarget.data().id) {
			    		let linkCheck = false;
			    		cy.edges().forEach(function(l) {
			    			let lData = l.data();
	                		if((lData.source === device.id && lData.target === evtTarget.data().id)
	                				|| (l.data().source === evtTarget.data().id && lData.target === device.id)) {
	                			linkCheck = true;
	                			return;
	                		}
	                	});
	                	
	                	if(linkCheck) return;
			    		
			    		cy.add({
				    		  group: "edges",
				    		  data: {source: device.id, target:evtTarget.data().id, nId:'newEdge'}
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
		
		//console.log("=======dataElements :", cy.elements().jsons());
		//console.log("=======dataElements1 :", cy.nodes().jsons());
		console.log("=======dataElements1 :", cy.nodes("[nId = 'newNode']").jsons());
		//alert(JSON.stringify(cy.nodes("[nId = 'newNode']").jsons()));
		

		$('html,body').css('cursor', 'default');
	};
	
	thisGraph.upFeederCheck = function() {
		let feeders = selTempSourceDevice.target;
		if(feeders.length > 1) return;
		
		let feederDevice = feeders[0];
		if(feederDevice.group() === "edges") return;
		
		let data = cy.edges("[target=\""+feederDevice.data().id+"\"]")[0];
		
		data.select();
		cy.$("#"+data.data().source).select();
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
	
	thisGraph.layOutPresetSet = function(nodes) {
		let posX = 600;
		let posY = 80;
		nodes.forEach(function(n){
			//console.log("n : ", n);
			n.position({
				  x: posX*n.data().level,
				  y: posY*n.data().row
			});
		});	
	}
	
	thisGraph.downFeederCheck = function() {
		let feeders = selTempSourceDevice.target;
		if(feeders.length > 1) return;
		
		let feederDevice = feeders[0];  
		if(feederDevice.group() === "edges") return;
		
		downDeviceCheck(cy.edges("[source=\""+feederDevice.data().id+"\"]"));
	};
	
	var downDeviceCheck = function(device) {
		device.forEach(function(n) {
			n.select();
			cy.$("#"+n.data('target')).select();
			downDeviceCheck(cy.edges("[source=\""+n.data().target+"\"]"));
		});
	};
	
	var addDeviceData = function() {
		let device = {
        		id:"newDevice"+newDeviceIdx, 
        		deviceOriginId:"newLabel"+newDeviceIdx,
        		faveShape: "ellipse",
        		nId:'newNode'
        }
		
		newDeviceIdx++;
		return device;
	};
};

$(function(){ // on dom ready
	var graphObj = new GraphObj();
	var topoOption = new TopoOptions(graphObj.getLayoutOption());
	const topoClass = new TopoClass();
	
	var cy = cytoscape({
		container: document.getElementById('cy')
		, pan: { x: 0, y: 0 }

		// interaction options:
		, minZoom: 0.1
		, maxZoom: 3
		, userZoomingEnabled: true
	
		, style: cytoscape.stylesheet()
			.selector('node')
			.css(topoClass.getNodeClass())
		    .selector('edge')
		    .css(topoClass.getEdgeClass())
		    .selector(':selected')
		    .css(topoClass.getSelectClass())
		    .selector('.faded')
		    .css({
		        'opacity': 0.25,
		        'text-opacity': 0
		}),
		  
		elements: dataElements,
		
		layout: {
		    name: 'preset'
		},
		  
		ready: function(){
			window.cy = this;
		}
	});
	
	//dataElements.nodes.find(checkAdult);
	
	/*cy.zoom({
		level: 2.1 // the zoom level
		//, renderedPosition: { x: 0, y: 0 }
	});*/
	
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
			console.log('tap on background : ', evtTarget);
			cy.$(':selected').unselect();
			if(graphObj.getNSelDataFunc() != 0) graphObj.setNSelDataFunc(-1);
		} else {
			console.log('tap on some element : ', evtTarget);
			if(evtTarget.group() === "nodes") {
				graphObj.deviceInfoInIt(evtTarget.data())
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
	
	graphObj.layOutPresetSet(cy.nodes());
	
	
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
	 

	let mpc = -1;
	cy.on('mouseover', 'node', function (evt) {
		mpc = -1
        $('html,body').css('cursor', 'pointer');
    });
	cy.on('mouseout', 'node', function (evt) {
		mpc = -1
        $('html,body').css('cursor', 'default');
    });
	
	cy.on('mousedown', 'node', function (evt) {
		mpc = 0;
    });
	
	cy.on('mousemove ', 'node', function (evt) {
		if(mpc === 0) mpc = 1;
    });
	
	cy.on('mouseup', 'node', function (evt) {
		if(mpc === 1) alert(evt.target.data().deviceOriginId);
		
		mpc = -1;
    });
	
	$('#config-toggle').on('click', function(){
		$('body').toggleClass('config-closed');
		cy.resize();
	});
	
	cy.nodes().forEach(function(n, i){
		//console.log("i : ", i);
		if(cy.nodes().length-1 === i) {
			n.style('background-color', 'blue')
		}
	});	
	
	cy.layout(topoOption.getOption()).run();
}); // on dom ready

$(function() {
	FastClick.attach( document.body );
});