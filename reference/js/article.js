function genMap(locationData){

	displayMap = function (data){
		
		var latLong = data.locations[0].latlong.split(",");
		//console.log(latLong);
		
		var myOptions = {
		  zoom: 10,
		  center: new google.maps.LatLng(latLong[0], latLong[1]),
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		
	
		var image = new google.maps.MarkerImage('/img/map_dot.png',
			new google.maps.Size(17, 19), // marker size
			new google.maps.Point(0,0), // origin point
			new google.maps.Point(10, 10)); //anchor point
	
		var bounds = new google.maps.LatLngBounds();
			
			//holdUpASec(map);
			
				/*
			var myLatLng = new google.maps.LatLng(lat,long);
			
			var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					icon: image,
					title: 'blah',
					clickable: true
				});
				
				*/
		for (var i = 0; i < data.locations.length; i++) {
			
			var latLong = data.locations[i].latlong.split(",");
			
			var myLatLng = new google.maps.LatLng(latLong[0], latLong[1]);
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				icon: image,
				title: 'name of place',
				clickable: false
			});
	
			bounds.extend(myLatLng);
			//map.fitBounds(bounds);
	
		}
		
	}
	
displayMap(locationData);

}


$(document).ready(function() {
					
					
				
	genMap(locationData);
	
	
	//genMap(36.005958,-105.945968);
	//$('#geocodePlace').submit(function(){codeAddress(); return false;});
	//$('#closeTools a').toggle(function(){ $('#mapTools').addClass('closed'); return false; }, function(){ $('#mapTools').removeClass('closed'); return false; });
	//genMap();
	//$('.mapDetail #map_canvas').mouseover(function(){ $('#map_canvas').height('300px'); return false;});
	//$('.mapDetail #map_canvas').mouseout(function(){ $('#map_canvas').height('150px'); return false;});
});