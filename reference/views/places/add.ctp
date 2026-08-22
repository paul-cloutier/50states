<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
	$this->Html->script('jquery.cookie', false);
	$this->Html->script('placeAdd', false);
	
	//debug($photos); 
?>				<div id="fullWidth">
	 				<div class="articleIndex">
	 					
	 					<h2>Add A New Place</h2>
	 					<div class="mapCoder">
	 						<div id="mapCenter"></div>
	 						<div class="coder"><form id="geocodePlace"><label for="searchText">General Area </label><input type="text" name="search" id="searchText"><input type="submit" value="Refocus the Map" > </form><a href="#" id="getAddress" >Get Address</a></div>
	 					</div>
	 					
	 					<?php
	 						echo $this->Form->create('Place');

	 							echo $this->Form->input('Place.name');
								echo $this->Form->input('Place.description');
								echo $this->Form->input('Place.address');
								echo $this->Form->input('Place.city');
								echo $this->Form->input('Place.state');
								echo $this->Form->input('Place.zip');
								echo $this->Form->input('Place.website');
								
								echo $this->Form->input('Place.latlong');
								
								echo $this->Form->input('Place.lat');
								echo $this->Form->input('Place.long');
								//echo $this->Form->input('Place.photos');
								//echo $this->Form->input('Place.articles');
	 					
								echo $this->Form->input('visited', array('type'=>'text', 'value'=>date('Y-m-d')));
						
						echo $this->Form->end(__('Save Place', true));
						
						?>
						
	 				</div>
	 				
	 			</div>






