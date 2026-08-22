<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
	$this->Html->script('jquery.cookie', false);
	$this->Html->script('articleAdd', false);
	
	//debug($photos); 
?>
				<div id="fullWidth">
	 				<div class="articleCreate">

	 					<h2>Publish a New Article</h2>
	 					<div class="mapCoder createLocation">
	 						<div id="mapCenter"></div>
	 						<div class="coder"><form id="geocodePlace"><label for="searchText">General Area </label><input type="text" name="search" id="searchText"><input type="submit" value="Refocus the Map" > </form><a href="#" id="getAddress" >Get Address</a></div>
	 					</div>
	 					
	 					<?php
		 					echo $this->Form->create('Article');
		 					
							echo $this->Form->input('Article.title');
							echo $this->Form->input('Article.abstract');
							
							
							
							
							?>
							
							<select name="data[Place][1][place_id]" id="Place1PlaceId">
								<option value="0">Create New Place</option>
								<?php
									foreach($places as $place){
										echo '<option value="'.$place['Place']['id'].'">'.$place['Place']['name'].' - '.$place['Place']['city'].', '.$place['Place']['state'].'</option>';	
									}
								
								?>
							</select>
							<div class="createLocation" id="locationInputs">
							<?php
							
							echo $this->Form->input('Place.1.name');
							
							echo $this->Form->input('Place.1.location');
							echo $this->Form->input('Place.1.lat');
							echo $this->Form->input('Place.1.long');
							
							
							echo $this->Form->input('Place.1.name');
							echo $this->Form->input('Place.1.address');
							echo $this->Form->input('Place.1.city');
							echo $this->Form->input('Place.1.state');
							echo $this->Form->input('Place.1.zip');
							
							echo $this->Form->input('Place.1.visited', array('type'=>'text', 'value'=>date('Y-m-d')));

							
							echo "</div><div class='allBlurbs'>";
							
							echo "<div class='blurb'>";
							echo "<div class='photoHolder' id='photoHolder1'><img src='/img/photoholder.png'></div>";
							echo $this->Form->input('Photo.1.photo_id', array('class'=>'addPhoto'));
							echo $this->Form->hidden('Photo.1.ordinal', array('value' => 1));
							echo $this->Form->input('ArticleBlurb.1.blurb');
							echo $this->Form->hidden('ArticleBlurb.1.ordinal', array('value' => 1));
							echo "</div>";
						
							echo "<div class='blurb'>";
							echo "<div class='photoHolder' id='photoHolder2'><img src='/img/photoholder.png'></div>";
							echo $this->Form->input('Photo.2.photo_id', array('class'=>'addPhoto'));
							echo $this->Form->hidden('Photo.2.ordinal', array('value' => 2));
							echo $this->Form->input('ArticleBlurb.2.blurb');
							echo $this->Form->hidden('ArticleBlurb.2.ordinal', array('value' => 2));
							echo "</div>";
						
						echo "</div>";
						
						echo "<input type='button' value='add blurb' id='addBlurb' >";
						
						echo $this->Form->end(__('Submit', true));
						?>

		 				<div id="photoChooser">
		 					<p>Choose a Photo for this section</p>
		 					<div id="photoClose"><a href="#">x</a></div>
		 					<ul>
		 						<?php foreach($photos as $photo): ?>
		 						<li><img src="<?php echo $photo['Photo']['thumbnail'];?>" id="<?php echo $photo['Photo']['id'];?>"></li>
		 						<?php endforeach; ?>
		 					</ul>
		 				</div>
	 				</div>
	 			</div>



