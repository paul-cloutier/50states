

<?php 
	if (!empty($photos)) {
		if($photos=="fail"){
			echo $photos;
		}else{
			//echo $this->Js->object($vehicles);
			$i=1;
			$totalPhotos = count($photos);
echo '{
	"photos": [';
	foreach($photos as $photo){
		if(!empty($photo['Photo']['latlong'])){
			echo '
			{
			"title": "'.$photo['Photo']['title'].'",
			"id": "'.$photo['Photo']['id'].'",
			"image": "'.$photo['Photo']['thumbnail'].'",
			"location": "'.$photo['Photo']['latlong'].'",
			"author": "'.$photo['User']['first_name']. ' '.$photo['User']['last_name']; if($totalPhotos==$i){echo '"}';}else{echo '"},';}
		}
		$i++;
	}	
echo ']}';
		
		}
	}
?>