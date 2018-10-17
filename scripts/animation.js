function animation(){
    var lc = document.getElementsByClassName('leaflet-bar-timecontrol');
    console.log(lc[0])
    lc[0].style.visibility = 'visible';
    map.fitBounds(gpxLayer.getBounds(),{
        paddingBottomRight: [40, 40]
    });
}