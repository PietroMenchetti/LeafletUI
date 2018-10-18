var countriesLayer;			//map selection layer loaded from geojson
var selectedCountries = []; //features selected by clicking

var selectedArea = {}; 		// layer selected by drawing
var selectedFeature = {};	// feature selected by drawing
// the first is needed for reset selection, the second to query in geoJson format

var map; // the map object

var startDate = new Date(); 		// animation part

var timeDimension; 					// animation part
var gpxLayer;

$(window).on('load', function () {
	startDate.setUTCHours(0, 0, 0, 0); 	// animation part
	initializeMap()
	initLeafleatDraw()
	initLeafletTime()
});

// Panes are DOM elements used to control the ordering of layers on the map.



function initializeMap(){
	// create map
	map = L.map('map',{zoom : 5});
	// set initial postion
	map.setView([34.960937499999996,
		39.095962936305476], 3);

	startDate	= new Date();
	startDate.setUTCHours(0, 0, 0, 0);
			

	// get tile layer for the underneath map
	var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
											maxZoom: 20,
											attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});

	// add tile layer to the map
	OpenStreetMap_France.addTo(map)
	// get json
	countriesLayer = L.geoJson(countries,
	{
			style:countriesStyle,
			onEachFeature : onSelectionFeature
	})
}


function countriesStyle(feature){
	return {
		weight: 1,
		color: 'black',
		fillOpacity : 0,
		stroke: 'black'
	}
}
function onSelectionFeature(feature,layer){
	layer.on(
		{
			click:changeFeature
		}
	)
}

function changeFeature(e){
	var layer = e.target;
	layer.setStyle(
		{
			color : 'yellow',
			fillOpacity : 0.2
		}
	)
	if(!selectedCountries.includes(e.target.feature)){
		selectedCountries.push(e.target.feature)
	}
}

function resetView(){
	var lc = document.getElementsByClassName('leaflet-bar-timecontrol');
    lc[0].style.visibility = 'hidden';
	map.setView([34.960937499999996,
		39.095962936305476], 3);
}

function selection(){
	var x = document.getElementById("selection");
	var lc = document.getElementsByClassName('leaflet-draw-toolbar');
	console.log(lc)
	if(selectedArea)
	{
		map.removeLayer(selectedArea)
		selectedFeature = {}
	}
	if(!map.hasLayer(countriesLayer))
	{
		countriesLayer.addTo(map)
		x.textContent = "Reset";
		// hide the area selection options
		lc[0].style.visibility = 'hidden';       
	}else	// need to reset style of already selected countries
	{
		countriesLayer.eachLayer((layer) =>{
			countriesLayer.resetStyle(layer)
		})
		//  remove the countries layer
		map.removeLayer(countriesLayer)
		// set = [] the countries layer selected
		selectedCountries = [];
		x.textContent = "Select Countries";
		// make visibile the area selection options
		lc[0].style.visibility = 'visible';
	}
}




function resetSelection(){
	countriesLayer.eachLayer(function (layer){
		countriesLayer.resetStyle(layer)
	})
	selectedCountries = [];
}

function initLeafleatDraw(){
	var drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);
	var drawControl = new L.Control.Draw({
		draw: {
			polygon: false,
			marker: false,
			circlemarker: false,
			polyline: false
		},
		edit: {
			featureGroup: drawnItems,
			edit: false,
			remove: false
		}
	})
	
	map.addControl(drawControl);

	map.on(L.Draw.Event.CREATED, function (e) {

		var	layer = e.layer;
		if(selectedArea){
			// Remove existing layer
			map.removeLayer(selectedArea);
		}
		// Set  selectedArea, selectedFeature, the first is needed for reset selection, the second to query in geoJson format
		selectedArea = layer;
		selectedFeature = layer.toGeoJSON()
		L.extend(selectedArea.properties, selectedArea.properties)
		// Adding the new Layer created to the map
		map.addLayer(selectedArea);

		selectedArea.on('click',(e)=>{
			var layer = e.target;
			map.removeLayer(layer)
			selectedArea = {};
			selectedFeature = {};
		})
		selectedArea.on('mouseover',(e)=>{
			var layer = e.target;
			layer.bindTooltip("Click to remove selection").openTooltip();
		})
		selectedArea.on('mouseout',(e)=>{
			var layer = e.target;
			layer.closeTooltip();
		})


	 });
}

function initLeafletTime(){
	// TimeDimension object manages the time component of a layer.
	timeDimension = new L.TimeDimension({
    	period: "PT5M",
	});

// helper to share the timeDimension object between all layers
	map.timeDimension = timeDimension;

//Player -> Component to animate a map with a TimeDimension, changing the time periodically.
	var player        = new L.TimeDimension.Player({
    	transitionTime: 100, 
    	loop: false,
    	startOver:true
	}, timeDimension);

// Control.TimeDimension -> Leaflet control to manage a timeDimension. 

var timeDimensionControlOptions = {
    player:        player,
    timeDimension: timeDimension,
    position:      'bottomleft',
    autoPlay:      true,
    minSpeed:      1,
    speedStep:     0.5,
    maxSpeed:      15,
    timeSliderDragUpdate: true
	};


var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
	map.addControl(timeDimensionControl);

	gpxLayer = omnivore.gpx('data/running_mallorca.gpx');

var gpxTimeLayer = L.timeDimension.layer.geoJson(gpxLayer, {
    updateTimeDimension: true,
    addlastPoint: true,
    waitForReady: true
	});

	gpxTimeLayer.addTo(map);
}




/*countriesLayer = L.geoJson(countries,
	{
	}).addTo(map);
*/

/*function style(feature){
	return {
		fillColor: '#00ff00', //i can put a function that takes .properties of feature
 		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}*/
// Add an SVG element to Leaflet’s overlay pane
/*var svg = d3.select(map.getPanes().overlayPane).append("svg"),
g = svg.append("g").attr("class", "leaflet-zoom-hide");

//This is pretty standard fare for d3.js but it’s worth being mindful that 
//while the type of data file is .json this is a GeoJSON file and they have particular features (literally) 
//that allow them to do their magic

d3.json("rectangle.json", function(geoShape) {

		//  create a d3.geo.path to convert GeoJSON to SVG
	var transform = d3.geo.transform({point: projectPoint}),
			path = d3.geo.path().projection(transform);

		// create path elements for each of the features
		d3_features = g.selectAll("path")
						.data(geoShape.features)
						.enter().append("path");

	map.on("viewreset", reset);

	reset();

	// fit the SVG element to leaflet's map layer
	function reset() {

	bounds = path.bounds(geoShape);

	var topLeft = bounds[0],
	bottomRight = bounds[1];

	svg .attr("width", bottomRight[0] - topLeft[0])
		.attr("height", bottomRight[1] - topLeft[1])
		.style("left", topLeft[0] + "px")
		.style("top", topLeft[1] + "px");

	g.attr("transform", "translate(" + -topLeft[0] + ","  + -topLeft[1] + ")");

// initialize the path data 
	d3_features.attr("d", path)
			.style("fill-opacity", 0.7)
			.attr('fill','white');
	}	 

// Use Leaflet to implement a D3 geometric transformation.
//Using our data we need to ensure that it is correctly transformed from our latitude/longitude coordinates as supplied to coordinates on the screen. We do this by implementing d3’s geographic transformation features
	function projectPoint(x, y) {
	var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	this.stream.point(point.x, point.y);
	}

})*/


