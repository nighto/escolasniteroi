/*
    Mapeamento das escolas em Niterói feito no OpenStreetMap
    Por Arlindo Pereira
    http://arlindopereira.com
*/

var MAP_DATA_URL = "data.json";
var CloudMade_API_key = "ea7350f1880845eabc4585641710ea28";
var initialLatLon = [-22.9208,-43.0566];
var initialZoomLevel = 12;
var map,         // the leaflet map instance
    DefaultIcon; // IconClass to extend with colors

$(document).ready(function(){
    initializeMap();
    getMapData();
    handleMessageClose();
});

function initializeMap(){

    // initializing map zoomed out on the whole city
    map = L.map('map').setView(initialLatLon, initialZoomLevel);

    L.tileLayer('http://{s}.tile.cloudmade.com/'+CloudMade_API_key+'/997/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.educacaoniteroi.com.br/">FME Niterói</a> e <a href="http://openstreetmap.org">OpenStreetMap</a>, <a href="http://opendatacommons.org/licenses/odbl/">ODbL</a>, Gráficos <a href="http://cloudmade.com">CloudMade</a> e <a href="http://mapicons.nicolasmollet.com/">MapIcons</a>'
    }).addTo(map);

    // defining geolocalization functions
    // function onLocationFound(e) {
    //     var radius = e.accuracy / 2;

    //     L.marker(e.latlng).addTo(map)
    //         .bindPopup("Você está num raio de " + ~~radius + " metros deste ponto").openPopup();

    //     L.circle(e.latlng, radius).addTo(map);
    // }

    // function onLocationError(e) {
    //     alert(e.message);
    // }

    //map.on('locationfound', onLocationFound);
    //map.on('locationerror', onLocationError);

    //map.locate({setView: true, maxZoom: 16}); // don't get too close

    // defining map icon
    DefaultIcon = L.Icon.extend({
        options: {
            shadowUrl: 'icons/shadow.png',
            iconSize:     [32, 37], // size of the icon
            shadowSize:   [51, 37], // size of the shadow
            iconAnchor:   [16, 34], // point of the icon which will correspond to marker's location
            shadowAnchor: [25, 36], // the same for the shadow
            popupAnchor:  [0, -16]  // point from which the popup should open relative to the iconAnchor
        }
    });
};

function getMapData(){
    $.getJSON(MAP_DATA_URL, function(data){
        processMapData(data);
    });
};

function processMapData(mapData){
    // defining arrays to store the correspondent points
    var CC   = [];
    var EM   = [];
    var NAEI = [];
    var UMEI = [];
    
    for(var i=0, len=mapData.objects.length; i<len; i++){
        var category;

        switch(mapData.objects[i].type){ // column with the type
            case "Creche Comunitária":
                category = CC; break;
            case "Escola Municipal":
                category = EM; break;
            case "Núcleo Avançado de Educação Infantil":
                category = NAEI; break;
            case "Unidade Municipal de Educação Infantil":
                category = UMEI; break;
        }

        if( category !== undefined )
            category.push(mapData.objects[i]); // add to the given category array the point array
    }

    // defining layers with the pins and their icons
    var lCC   = addPins(CC, 'nursery');
    var lEM   = addPins(EM, 'school');
    var lNAEI = addPins(NAEI, 'school-red');
    var lUMEI = addPins(UMEI, 'school-green');

    // adding them to the list of layers
    var overlayMaps = {
        "Creche Comunitária":                     lCC,
        "Escola Municipal":                       lEM,
        "Núcleo Avançado de Educação Infantil":   lNAEI,
        "Unidade Municipal de Educação Infantil": lUMEI
    };

    // and adding the list to map
    L.control.layers(null, overlayMaps).addTo(map);
};

function addPins(elements, id){
    // defining an empty array to fill with markers
    var markerArray = [];

    for(var i=0, len=elements.length; i<len; i++){
        var lat   = elements[i].geometry[1];
        var lon   = elements[i].geometry[0];
        var title = elements[i].name;
        var text  = elements[i].address;
        var popupText = '<b>'+title+'</b><br>'+text;

        if(elements[i].aproximate_position !== undefined && elements[i].aproximate_position == 'yes')
            popupText += '<br>(Posição Aproximada)';

        if(elements[i].photos !== undefined){
            popupText += '<br>Fotos:<br>';
            for(var f=0, qtdFotos=elements[i].photos.length, fNum; f<qtdFotos; f++){
                fNum = f+1;
                if(f>0)
                    popupText += ' - ';
                popupText += '<a target="_blank" href="photos/'+elements[i].photos[f]+'">Foto '+fNum+'</a>';
            }
        }

        var elementIcon = new DefaultIcon({iconUrl: 'icons/'+id+'.png'});

        // creating a marker for every point and pushing to the array
        markerArray.push( L.marker( [lat, lon], {icon: elementIcon} ).bindPopup(popupText) );
    }

    // returns the layer with all markers
    return L.layerGroup(markerArray);
};

function handleMessageClose(){
    $('.message-close-button, #message').on('click', function(){
        $('#message').remove();
        $('#logo').show();
    });
};