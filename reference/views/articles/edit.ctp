<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
	$this->Html->script('articleAdd', false);
	
	//debug($this->data); 
?>
				<div id="fullWidth">
	 				<div class="articleCreate">

	 					<h2>Editing Article: <?php echo $this->data['Article']['title']; ?></h2>
	 					<?php
	 					echo $this->Form->create('Article', array('url'=>'/articles/'.$this->data['Article']['id'].'/edit/'));
	 					echo $this->Form->input('Article.id');
						echo $this->Form->input('Article.title');
						echo $this->Form->input('Article.abstract');
						?>
						
						<div id="mapCenter"></div>
						<span id="lat"></span> <span id="lon"></span>
						<?php
						//echo $this->Form->input('ArticleLocation.1.location');
						
						echo '<div class="input text">
						<input type="hidden" name="data[ArticleLocation][1][id]" value="'. $this->data['ArticleLocation'][0]['id'] .'" id="ArticleLocation1Id">
						<label for="ArticleLocation1Location">Location</label>
						<input name="data[ArticleLocation][1][location]" type="text" maxlength="255" value="'. $this->data['ArticleLocation'][0]['location'] .'" id="ArticleLocation1Location">
						</div>';
						
						if(!empty($this->data['ArticleBlurb'])){
						
							echo "<div class='allBlurbs'>";
								$i=1;
								foreach($this->data['ArticleBlurb'] as $blurb){
									$n = $i-1;
									echo '<div class="blurb">';
									
										echo '<input type="hidden" name="data[Photo]['.$n.'][id]" value="'. $this->data['Photo'][$n]['id'] .'" id="Photo'.$n.'Id">';
										
										echo '<div class="input text"><label for="Photo'.$n.'PhotoId">Photo</label>';
										echo '<input name="data[Photo]['.$n.'][photo_id]" type="text" class="addPhoto" value="'. $this->data['Photo'][$n]['id'] .'" id="Photo'.$n.'PhotoId">';
										
										echo '<input type="hidden" name="data[Photo]['.$n.'][ordinal]" value="'.$i.'" id="Photo'.$n.'Ordinal">';
										echo '</div>';
										
										echo '<input type="hidden" name="data[ArticleBlurb]['.$n.'][id]" value="'. $this->data['ArticleBlurb'][$n]['id'] .'" id="ArticleBlurb'.$n.'Id">';
										echo '<div class="input textarea"><label for="ArticleBlurb'.$n.'Blurb">Blurb</label>';
										echo '<textarea name="data[ArticleBlurb]['.$n.'][blurb]" cols="30" rows="6" id="ArticleBlurb'.$n.'Blurb">';
										
										echo $this->data['ArticleBlurb'][$n]['blurb'];
										
										echo '</textarea>';
										
										//echo '<input type="hidden" name="data[ArticleBlurb]['.$n.'][ordinal]" value="'.$i.'" id="ArticleBlurb'.$i.'Ordinal">';
										echo '</div>';
									echo '</div>';
									$i++;
								}
								
								
								
								//echo "<div class='blurb'>";
								//echo $this->Form->input('Photo.2.photo_id', array('class'=>'addPhoto'));
								//echo $this->Form->hidden('Photo.2.ordinal', array('value' => 2));
								//echo $this->Form->input('ArticleBlurb.2.blurb');
								//echo $this->Form->hidden('ArticleBlurb.2.ordinal', array('value' => 2));
								//echo "</div>";
							
							echo "</div>";
						}
						
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

