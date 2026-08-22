<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
	
	$this->Html->script('jquery-ui-1.8.18.custom.min', false);
	$this->Html->script('jquery.ui.core', false);
	$this->Html->script('jquery.ui.position', false);
	$this->Html->script('jquery.ui.autocomplete', false);
	$this->Html->script('jquery.ui.button', false);
	$this->Html->script('combobox', false);
	$this->Html->css('ui-lightness/jquery-ui-1.8.18.custom');
	
	$this->Html->script('jquery.cookie', false);
	$this->Html->script('photoAdd', false);
	
	//debug($tags); 
?>
<link rel="stylesheet" type="text/css" href="/css/ui-lightness/jquery-ui-1.8.18.custom.css">
				<div id="fullWidth">
	 				<div class="articleIndex">
	 					
	 					<h2>Add A New Photo</h2>
	 					<div class="mapCoder createLocation">
	 						<div id="mapCenter"></div>
	 						<div class="coder"><form id="geocodePlace"><label for="searchText">General Area </label><input type="text" name="search" id="searchText"><input type="submit" value="Refocus the Map" > </form><a href="#" id="getAddress" >Get Address</a></div>
	 					</div>
	 					
	 					<?php
	 					
	 					echo $this->Form->create('Photo', array('type' => 'file'));
	 					
	 					echo $this->Form->input('Photo.image', array('type' => 'file'));
	 					
						echo $this->Form->input('Photo.title');
						
						echo $this->Form->input('Photo.caption'); 
						
						//echo $this->Form->input('Tags.tag',  array('multiple' => 'multiple', 'class' => 'selectMultiple')); ?>						
						
						<select name="data[Photo][place_id]" id="PhotoPlaceId">
							<option value="0">Create New Place</option>
							<?php
								foreach($places as $place){
									echo '<option value="'.$place['Place']['id'].'">'.$place['Place']['name'].' - '.$place['Place']['city'].', '.$place['Place']['state'].'</option>';	
								}
							
							?>
						</select>
							
						<div class="createLocation" id="locationInputs">
						
						<?php 
						
						echo $this->Form->input('Photo.name');
						
						echo $this->Form->input('Photo.latlong');
						
						echo $this->Form->input('Photo.lat');
						
						echo $this->Form->input('Photo.long');
				
						echo $this->Form->input('Photo.address');
						
						echo $this->Form->input('Photo.city');
						
						echo $this->Form->input('Photo.state');
						
						echo $this->Form->input('Photo.zip');
						
						echo $this->Form->input('Photo.visited', array('type'=>'text', 'value'=>date('Y-m-d'))); 
						
						echo "</div>";
						
						echo $this->Form->end(__('Save Photo', true));
						
						?>
						
	 				</div>
	 				
	 			</div>


<?php /*
<div class="photos form">
<?php echo $this->Form->create('Photo');?>
	<fieldset>
 		<legend><?php __('Add Photo'); ?></legend>
	<?php
		echo $this->Form->input('user_id');
		echo $this->Form->input('title');
		echo $this->Form->input('caption');
		echo $this->Form->input('url');
		echo $this->Form->input('Article');
	?>
	</fieldset>
<?php echo $this->Form->end(__('Submit', true));?>
</div>
<div class="actions">
	<h3><?php __('Actions'); ?></h3>
	<ul>

		<li><?php echo $this->Html->link(__('List Photos', true), array('action' => 'index'));?></li>
		<li><?php echo $this->Html->link(__('List Users', true), array('controller' => 'users', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New User', true), array('controller' => 'users', 'action' => 'add')); ?> </li>
		<li><?php echo $this->Html->link(__('List Articles', true), array('controller' => 'articles', 'action' => 'index')); ?> </li>
		<li><?php echo $this->Html->link(__('New Article', true), array('controller' => 'articles', 'action' => 'add')); ?> </li>
	</ul>
</div>
*/ ?>