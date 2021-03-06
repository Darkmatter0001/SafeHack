 var travelSpeed = 60; // km/h

        var polyline = null;
        var poly2 = null;
        var speed = 0.000005, wait = 1;
        var map = null;

        var myPano;
        var panoClient;
        var nextPanoId;
        var timerHandle = null;

        var directionDisplay = null;
        var directionService = null;

        var speedPerMilliseconds = travelSpeed / 3600000;

        console.log("speed :" + speedPerMilliseconds);

        var step = 10; // 5; // metres
        var tick = 100; // milliseconds
        var eol;
        var k = 0;
        var stepnum = 0;
        //var speed = "";
        var lastVertex = 1;
          
        var startpoint = { lat: -34.931645, lng: 138.623834 };
        var endpoint = { lat: -34.915351, lng: 138.640451 };

       


        var wayPointLow = [
        {
            location: { lat: -34.930632, lng: 138.636624 },
            stopover: false
        },
        {
            location: { lat: -34.924123, lng: 138.637682 },
            stopover: false
        },
        {
            location: { lat: -34.918020, lng: 138.637295 },
            stopover: false
        }
        ];


        var wayPointMedium = [
            {
            location: { lat: -34.930632, lng: 138.636624 },
            stopover: false
            },
            
            {
                location: { lat: -34.926848, lng: 138.641324 },
                stopover: false
            },
            {
                location: { lat: -34.923029, lng: 138.641079 },
                stopover: false
            }
        ];

        var wayPointHigh = [
        
        {
            location: { lat: -34.927845, lng: 138.623631 },
            stopover: false
        },
        {
            location: { lat: -34.927794, lng: 138.624959 },
            stopover: false
        },
        {
            location: { lat: -34.927427, lng: 138.631738 },
            stopover: false
        },
        {
            location: { lat: -34.927007, lng: 138.640898 },
            stopover: false
        },
        {
            location: { lat: -34.926559, lng: 138.641375 },
            stopover: false
        }
        ];

        var marker = null;
        
        var crashSpots = [
        {
            location: { lat: -34.927921, lng: 138.623437},
            Crashes:  300
        },


    {
        location: { lat: -34.927130, lng: 138.622621},
        Crashes:  50
    },
    {
        location: { lat: -34.927110, lng: 138.637032},
        Crashes:  50
    },

    {
        location: { lat: -34.9268871, lng: 138.6414078},
        Crashes:  99
    },

    {
        location: { lat: -34.923968, lng: 138.641226},
        Crashes:  50
    },
    {
        location: { lat: -34.927775, lng: 138.625833 },
        Crashes:  50
    },
    {
        location: { lat: -34.927658, lng: 138.628029 },
        Crashes: 50
    },
    {
        location: { lat: -34.927411, lng: 138.632536 },
        Crashes: 50
    },
    {
        location: { lat: -34.920956, lng: 138.640973 },
        Crashes:  50
    }


        ];
        function addHeatMaps()
        {
            
            // -34.927898, 138.623394

            for (var crashSpot in crashSpots) {
                console.log("location : " + crashSpots[crashSpot].location);
                console.log("adding heatmap spot");
                // Add the circle for this city to the map.
                var crashCircle = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    map: map,
                    center: crashSpots[crashSpot].location,
                    radius: Math.sqrt(crashSpots[crashSpot].Crashes) * 5
                });
                //crashCircle.setMap(crashCircle);
            }
        }

        function initMap() {

            directionDisplay = new google.maps.DirectionsRenderer;
            directionService = new google.maps.DirectionsService;

            map = new google.maps.Map(document.getElementById("map"), { zoom: 14, center: { lat: -34.783671, lng: 138.606396 } });

            map.setOptions({ draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true });

            addHeatMaps();

           
            var startMarker = new google.maps.Marker({
                position: new google.maps.LatLng(startpoint.lat, startpoint.lng),
                map: map
            });

            var endMarker = new google.maps.Marker({
                position: new google.maps.LatLng(endpoint.lat, endpoint.lng),
                map: map
            });

            directionDisplay.setMap(map);

            

            calculateAndDisplayRoute(directionService, directionDisplay, wayPointLow);

            
            document.getElementById('btnStop').addEventListener("click", function () {
                stopAnimation();
            }) 

            document.getElementById('btnStart').addEventListener("click", function () {
                calcRoute();
                startAnimation();
                
            })
            // Binding Dropdown
            document.getElementById('riskProfile').addEventListener('change', function () {
                
                var riskProfile = document.getElementById('riskProfile').value;
                if (riskProfile == "high")
                {
                    calculateAndDisplayRoute(directionService, directionDisplay, wayPointHigh);
                }
                else if (riskProfile == "medium")
                {
                    calculateAndDisplayRoute(directionService, directionDisplay, wayPointMedium);
                    //calculateAndDisplayRoute(directionService, directionDisplay, wayPointMedium);
                } else {

                    calculateAndDisplayRoute(directionService, directionDisplay, wayPointLow);
                }
            });

            polyline = new google.maps.Polyline({
                path: [],
                strokeColor: '#FF0000',
                strokeWeight: 3
            });
            poly2 = new google.maps.Polyline({
                path: [],
                strokeColor: '#FF0000',
                strokeWeight: 3
            });
        }

        var steps = [];
        var paths = [];


        function calcRoute() {
            
            if (timerHandle) { clearTimeout(timerHandle); }
            //if (marker) { marker.setMap(null); }
            polyline.setMap(null);
            poly2.setMap(null);
            directionDisplay.setMap(null);
            polyline = new google.maps.Polyline({
                path: [],
                strokeColor: '#FF0000',
                strokeWeight: 3
            });
            poly2 = new google.maps.Polyline({
                path: [],
                strokeColor: '#FF0000',
                strokeWeight: 3
            });
            // Create a renderer for directions and bind it to the map.
            var rendererOptions = {
                map: map
            }
            directionDisplay = new google.maps.DirectionsRenderer(rendererOptions);
           
            // Route the directions and pass the response to a
            // function to create markers for each step.

            var selWaypoint = null;
            var riskProfile = document.getElementById('riskProfile').value;
            if (riskProfile == "high") {
                selWaypoint=  wayPointHigh;
            }
            else if (riskProfile == "medium") {
                selWaypoint = wayPointMedium;
            } else {
                selWaypoint = wayPointLow;

                //calculateAndDisplayRoute(directionService, directionDisplay, wayPointLow);
            }


            directionService.route({
                origin: { lat: startpoint.lat, lng: startpoint.lng },  // Haight.
                destination: { lat: endpoint.lat, lng: endpoint.lng },  // Ocean Beach.
                waypoints: selWaypoint
                ,
                
                travelMode: google.maps.TravelMode["DRIVING"]
            }, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionDisplay.setDirections(response);

                    var bounds = new google.maps.LatLngBounds();
                    var route = response.routes[0];
                    startLocation = new Object();
                    endLocation = new Object();

                    // For each route, display summary information.
                    var path = response.routes[0].overview_path;
                    var legs = response.routes[0].legs;
                    paths = [];
                    for (i = 0; i < legs.length; i++) {
                        if (i == 0) {
                            startLocation.latlng = legs[i].start_location;
                            startLocation.address = legs[i].start_address;
                            // marker = google.maps.Marker({map:map,position: startLocation.latlng});
                            marker = createMarker(legs[i].start_location, "start", legs[i].start_address, "green");
                        }
                        endLocation.latlng = legs[i].end_location;
                        endLocation.address = legs[i].end_address;
                        var steps = legs[i].steps;

                        for (j = 0; j < steps.length; j++) {
                            //paths.push(steps[j].path);
                            //paths.push(steps[j].path);
                            var nextSegment = steps[j].path;
                            for (k = 0; k < nextSegment.length; k++) {
                                polyline.getPath().push(nextSegment[k]);
                                bounds.extend(nextSegment[k]);
                            }
                        }
                    }

                    polyline.setMap(map);
                    map.fitBounds(bounds);
                    map.setZoom(18);
                    startAnimation();
                }
            });
        }


        function calculateAndDisplayRoute(directionsService, directionsDisplay, waypoints) {
            directionsService.route({
                origin: { lat: startpoint.lat, lng: startpoint.lng },  // Haight.
                destination: { lat: endpoint.lat, lng: endpoint.lng },  // Ocean Beach.
                waypoints: waypoints,
                travelMode: google.maps.TravelMode["DRIVING"]
            }, function (response, status) {
                if (status == 'OK') {
                    directionsDisplay.setDirections(response);

                    var route = response.routes[0];
                    var legs = route.legs;


                   for (var i = 0; i <= legs.length; i++)
                    {
                        //console.log(legs[i]);
                       var leg = route.legs[i];

                       console.log(leg.start_address);
                       console.log(leg.end_address);
                       console.log(leg.distance.text);


                        var steps = leg.steps;

                        for (var x = 0; x <= steps.length ; x++) {

                            console.log(steps[x]);
                            //console.log(steps[x].start_location);
                            //console.log(steps[x].start_location);

                        }

                    }
                    console.log(response.routes);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
        

        function createMarker(latlng, label, html) {
            // alert("createMarker("+latlng+","+label+","+html+","+color+")");
            var contentString = '<b>' + label + '</b><br>' + html;

            var marker = new google.maps.Marker({
                position: latlng,
                map: map,
                title: label,
                icon: "images/caricon.png",
                zIndex: Math.round(latlng.lat() * -100000) << 5
            });
            
            

            marker.myname = label;
            // gmarkers.push(marker);

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
            });

            return marker;
        }

       

        function updatePoly(d) {
            // Spawn a new polyline every 20 vertices, because updating a 100-vertex poly is too slow
            if (poly2.getPath().getLength() > 20) {
                poly2 = new google.maps.Polyline([polyline.getPath().getAt(lastVertex - 1)]);
                // map.addOverlay(poly2)
            }

            if (polyline.GetIndexAtDistance(d) < lastVertex + 2) {
                if (poly2.getPath().getLength() > 1) {
                    poly2.getPath().removeAt(poly2.getPath().getLength() - 1)
                }
                poly2.getPath().insertAt(poly2.getPath().getLength(), polyline.GetPointAtDistance(d));
            } else {
                poly2.getPath().insertAt(poly2.getPath().getLength(), endLocation.latlng);
            }
        }

        var currentPathIndex = -1;
        var pullOffCar = false;
        var animationInProgress = false;

        function animate(d) {
            // alert("animate("+d+")");
            if (d > eol || pullOffCar == true) {
                console.log("route complete bcs :" + eol);

                map.panTo(endLocation.latlng);
                marker.setPosition(endLocation.latlng);
                //marker.setMap(null);

                polyline.setMap(null);
                poly2.setMap(null);
                marker.setMap(null);
                document.getElementById("btnStart").disabled = false;

                pullOffCar = false;

                if (timerHandle) {
                    clearTimeout(timerHandle);
                    animationInProgress = false;
                }

                return;
            }
            var p = polyline.GetPointAtDistance(d);
            //console.log("lat lang :" + p);
            var index = 0;
            for (var path in paths)
            {
                //p1 = new google.maps.Polygon({ paths: p.getAt(0).getArray() })
                //alert(google.maps.geometry.poly.containsLocation)

                if (google.maps.geometry.poly.containsLocation(p, path))
                {
                    currentPathIndex = index;
                }

                index += 1;
            }

            //console.log("Path Index : " + currentPathIndex);

            map.panTo(p);
            marker.setPosition(p);
            updatePoly(d);

            timerHandle = setTimeout("animate(" + (d + step) + ")", tick);
        }



        function startAnimation() {

            document.getElementById("btnStart").disabled = true;

            console.log("Timer Handle :" + timerHandle);


            animationInProgress = true;
            eol = polyline.Distance();
            map.setCenter(polyline.getPath().getAt(0));

            poly2 = new google.maps.Polyline({ path: [polyline.getPath().getAt(0)], strokeColor: "#0000FF", strokeWeight: 10 });
            
            setTimeout("animate(50)", 2000);  // Allow time for the initial map display
        }

        function stopAnimation()
        {
            if (timerHandle){
                pullOffCar= true;
                document.getElementById("btnStart").disabled = false;
                //map.setCenter(polyline.getPath().getAt(0));
              }
        }