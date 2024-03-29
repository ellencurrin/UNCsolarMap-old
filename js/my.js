function loadLayers (layerURL) { 
    $.ajax({
            type:"GET",
            url: layerURL,
            dataType:"text",
            success: parseData
    });   
}
function parseData(data){
        dataObj = $.parseJSON(data);
        console.log(dataObj);
}



$(document).ready(function() {
    console.log("ready")
    buildMap();
    setVariables();
    loadLayers('data/solar_point.geojson');   
});

//****** SETTING RESULT VARIABLES
var pts
var bldg
var counter = 0

var totalSolar
var sysCost
var years
var costKWH
var sysEff
var panelEff
var time
var minValue
var interval, interval2, interval3, interval4
var ptStatus = false

function setVariables(){
    console.log("variables applied")
    sysCost = document.getElementById("sysCost").value
    years = document.getElementById("years").value
    costKWH = document.getElementById("costKWH").value
    sysEff = (document.getElementById("sysEff").value)/100
    panelEff = (document.getElementById("panelEff").value)/100
    time = 365
    minValue = sysCost/years/costKWH/sysEff/panelEff/time
    interval = (6-minValue)/4
    console.log(interval*4)
    
    if (counter >= 1) {
        console.log("remove")
        map.removeLayer(bldg);
        addBldg()
        if (ptStatus == true) {
            addPts()
        }
    } else {
        console.log("no remove")
        addBldg();
    }
    
}




//****** BUILDING MAP 
function buildMap() {
    console.log("building map")
    L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A';
    map = L.mapbox.map('map', 'elcurr.l88ahg8f')
        .setView([35.9083, -79.0480], 16);    
    //addLayers()
    
}

function addBldg() {
    bldg = omnivore.geojson('data/bldg_feasibility.geojson')
    .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    
                    polygon.bindLabel(polygon.feature.properties.buildingna)
                    
                    polygon.on('click', function() {
                        onClick(polygon);
                    });
                    if (polygon.feature.properties.kwm2day_avg >= minValue) {
                        //console.log()
                        polygon.setStyle ( {
                                color: '#fff',
                                opacity: 1,
                                weight: 1, 
                                fillColor: '#56A0D3',
                                fillOpacity: .5
                                // for more options--> 'leaflet.js path options'
                        })
                        .addTo(map);
                    } else {
                        polygon.setStyle ( {
                                color: '#fff',
                                opacity: 1,
                                weight: 1, 
                                fillColor: '#56A0D3',
                                fillOpacity: .5
                                // for more options--> 'leaflet.js path options'
                        })
                        .addTo(map);
                    }
                })
        }).addTo(map)
    
    counter ++
    
    //.addTo(map)
}

function addPts() {    
    pts = omnivore.geojson('data/solar_point.geojson')
    .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    //console.log(minValue)
                    //console.log(marker.feature.properties.kwh_m2_day)
                    if (marker.feature.properties.kwh_m2_day >= (minValue + interval*3)) {
                        marker.setIcon(L.divIcon({
                            className: 'pt1',
                            html: '<b style="font-size:33px;";>&#8226</b>',
                            iconAnchor: [2,2],
                            iconSize: [150, 40]
                        }))
                        marker.addTo(map)
                    } else if (marker.feature.properties.kwh_m2_day >= (minValue + interval*2)) {
                        marker.setIcon(L.divIcon({
                            className: 'pt2',
                            html: '<b style="font-size:33px;";>&#8226</b>',
                            iconAnchor: [2,2],
                            iconSize: [150, 40]
                        })).addTo(map)
                    } else if (marker.feature.properties.kwh_m2_day >= (minValue + interval)) {
                        marker.setIcon(L.divIcon({
                            className: 'pt3',
                            html: '<b style="font-size:33px;";>&#8226</b>',
                            iconAnchor: [2,2],
                            iconSize: [150, 40]
                        })).addTo(map)
                    } else if (marker.feature.properties.kwh_m2_day >= minValue) {
                        marker.setIcon(L.divIcon({
                            className: 'pt4',
                            html: '<b style="font-size:33px;";>&#8226</b>',
                            iconAnchor: [2,2],
                            iconSize: [150, 40]
                        })).addTo(map)
                    } else {console.log("no more points")}
                })
    })
    ptStatus = true
}


var runs = 0

function onClick(polygon) {
    runs ++
    if (runs > 1) {
        polygon_prev.setStyle ({
            color: '#fff',
            weight: 1,
        })
    }
    
    ///Info Window
    totalSolar = (polygon.feature.properties.kwm2day_sum).toFixed(2)
    var perTotal = (((polygon.feature.properties.usablearea/polygon.feature.properties.bldg_area))*100).toFixed(2)
    var savings = (totalSolar * 365 * costKWH).toFixed(2)
    var content = '<div class="info"><h2>' + polygon.feature.properties.buildingna + '</h2>'
        content += '<p> Total Roof Production: ' + totalSolar + ' kwh/day </p>'
        content +='<p> Usable area: ' + polygon.feature.properties.usablearea + ' sq ft (' + perTotal + '% of total) </p>'
        content +='<p> Max Number of panels: ' + polygon.feature.properties.numpanels + '</p>'
        content +='<p> Yearly savings: $' + savings + '</p>'
        content += '</div'>
    polygon.bindPopup(content);
    polygon.openPopup()
    .on('close', function(){
        console.log("closed")
        document.getElementById("activePolygon").style.weight = 1; 
        document.getElementById("activePolygon").id = ""
    })
    
    ///Reset Style
    polygon.setStyle ({
        color: '#56A0D3',
        weight: 4,
        opacity: 1
    })
    polygon_prev = polygon
    

}


//// COLLAPSE/EXPAND CUSTOMIZE DIV
function hide() {
    document.getElementById("customize").style.display = 'none';
    document.getElementById("map").style.left = '0';
}

//// TOGGLE PT LAYER
function togglePts() {
    console.log("togglingPts")
    addPts()
    
}
