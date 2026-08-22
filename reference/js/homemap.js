	function genMap(data){
	

	
		geocoder = new google.maps.Geocoder();
	
		var myOptions = {
		  zoom: 5,
		  center: new google.maps.LatLng(38.58, -109.55),
		  disableDefaultUI: true,
		  zoomControlOptions: {
		  	style: google.maps.ZoomControlStyle.LARGE
		  },
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		
		window.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

		loadRoute(window.map);
		
		
		//google.maps.event.addListener(ctaLayer, 'defaultviewport_changed', function() {
					//console.log('done loading');
					//var flightPlanCoordinates = [];
					//return false;
			var image = new google.maps.MarkerImage('/img/map_dot.png',
				new google.maps.Size(17, 19), // marker size
				new google.maps.Point(0,0), // origin point
				new google.maps.Point(10, 10)); //anchor point
				
			var imageGrey = new google.maps.MarkerImage('/img/map_dot_grey.png',
				new google.maps.Size(17, 19), // marker size
				new google.maps.Point(0,0), // origin point
				new google.maps.Point(10, 10)); //anchor point
	
			//var bounds = new google.maps.LatLngBounds();
			
			//holdUpASec(map);
			var randOpen = Math.floor(Math.random()*data.places.length);
			window.ib = new InfoBox();
			for (var i = 0; i < data.places.length; i++) {
				var place = data.places[i];
				var latLong = place.location.split(",");
				
				var myLatLng = new google.maps.LatLng(latLong[0], latLong[1]);
	
				if(place.articles > 0){
					
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						icon: image,
						title: place.name,
						clickable: true
					});
					
				}else{
				
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						icon: imageGrey,
						title: place.name,
						clickable: true
					});
		
				}
			
				
				
				
				var boxText = document.createElement("div");
				boxText.className = "infoBoxStyle";
				
				boxText.innerHTML = "<a href='/places/view/" + place.id + "'>" + place.name + " &raquo;</a><div>" + place.cityState + "</div><div>On " + place.visited + "</div>";
	
				myOptions = {
					alignBottom: true
					,content: boxText
					,pixelOffset: new google.maps.Size(-51, 30)                     
					,zIndex: -100
					
					,boxStyle: { 
						background: "url('/img/map_box_bottom.png') center bottom no-repeat"
						,opacity: 1
						,width: "199px"
					}
					,closeBoxMargin: "5px 5px 5px 5px"
					,closeBoxURL: "/img/map_closer_blue.png"
					,infoBoxClearance: new google.maps.Size(20, 20)
				};
	
				marker.content = boxText; 
				
	
				google.maps.event.addListener(marker, 'click', function() {
					window.ib.close();
					window.ib.setOptions(myOptions);
					window.ib.open(map,this);
					window.ib.setContent(this.content);
				});
				
				if(i == randOpen){
					
					window.ib.setOptions(myOptions);
					window.ib.open(map,marker);
					window.ib.setContent(marker.content);
					
					var newPos = window.ib.getPosition();
					map.setCenter(newPos);
					map.setZoom(8);
				}
				
			
			
			}

				
		//});
		
		//console.log(window.newPos);		
		//map.setCenter(newPos);
		//map.setZoom(5);
		
	
}

function loadRoute(map) {
	$.ajax({
		url: '/js/fullRoute.kml',
		dataType: 'text',
		success: function(kmlText) {
			var kml = new DOMParser().parseFromString(kmlText, 'text/xml');
			var coords = kml.getElementsByTagNameNS('http://www.opengis.net/kml/2.2', 'coordinates');

			if (!coords.length) {
				coords = kml.getElementsByTagName('coordinates');
			}

			for (var i = 0; i < coords.length; i++) {
				var coordText = coords[i].textContent || coords[i].innerHTML || '';
				var points = coordText.replace(/^\s+|\s+$/g, '').split(/\s+/);
				var path = [];

				for (var j = 0; j < points.length; j++) {
					if (!points[j]) {
						continue;
					}
					var parts = points[j].split(',');
					if (parts.length >= 2) {
						path.push(new google.maps.LatLng(parseFloat(parts[1]), parseFloat(parts[0])));
					}
				}

				if (path.length > 1) {
					new google.maps.Polyline({
						path: path,
						strokeColor: '#3c92ba',
						strokeOpacity: 1,
						strokeWeight: 4,
						geodesic: true,
						zIndex: 1,
						map: map
					});
				}
			}
		}
	});
}

  function codeAddress() {
    var address = document.getElementById("searchText").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        window.map.setCenter(results[0].geometry.location);
        //var marker = new google.maps.Marker({
         //   map: map, 
         //   position: results[0].geometry.location
        //});
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }



function getPlaceLocations() {
	$.post("/ajax/places/place_locations/",{data:{x:1}}, function(data) {
		if (data != "fail") {
			var placeLocations = $.parseJSON(data);
			//console.log(articleLocations);
			genMap(placeLocations);
			
		}else{
			console.log('fail');
			 //$("errorText").html(detailRequest);
		}
    }); 
     return false;  
} 
 





$(document).ready(function() {


	getPlaceLocations();
	$('#geocodePlace').submit(function(){codeAddress(); return false;});
	$('#closeTools a').toggle(function(){ $('#mapTools').addClass('closed'); return false; }, function(){ $('#mapTools').removeClass('closed'); return false; });

});