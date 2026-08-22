<?php 
	//debug($places);die;
	if (!empty($places)) {
		if($places=="fail"){
			echo $places;
		}else{
			//echo $this->Js->object($vehicles);
			$i=1;
			$totalPlaces = count($places);
echo '{
	"places": [';
	foreach($places as $place){
		if(!empty($place['Place']['lat'])){
			echo '
			{
			"name": "'.$place['Place']['name'].'",
			"id": "'.$place['Place']['id'].'",
			"visited": "'.$place[0]['visited'].'",
			"articles": "'.$place['Place']['articles_count'].'",
			"location": "'.$place['Place']['lat'].','.$place['Place']['long'].'",
			"cityState": "'.$place['Place']['city'].', '.$place['Place']['state'];
			 if($totalPlaces==$i){echo '"}';}else{echo '"},';}
		}
		$i++;
	}	
echo ']}';
		
		}
	}
?>