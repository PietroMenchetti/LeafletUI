app.controller('SimpleController',  function ($scope){
    $scope.drawCircle = function (Lat,Leng,Radius){
        var circle = L.circle([Lat, Leng], {radius: Radius,
            className: 'blinking'}); //
        circle.addTo(map);
        map.setView([Lat,Leng], 6);
        circle.setRadius(radius)
}});