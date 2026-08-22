<?php 
	//echo $this->Html->script('http://maps.google.com/maps/api/js?sensor=false');
		
	//echo $this->Html->script('infobox_packed');
	//echo $this->Html->script('jquery.json-2.2.min');
	echo $this->Html->script('photo', false);
	//$exif = exif_read_data($photo['Photo']['url']);
	//$exif = exif_read_data('http://farm1.static.flickr.com/76/209894279_1745e6fe8b_o.jpg');
	//debug($photo);
	//debug($relatedPhotos); 
?>
				<div id="fullWidth">
	 				<div class="photo">
						<div class="byLine"><img src="/img/<?php echo strtolower($photo['User']['first_name']); ?>_avatar_small.jpg" width="64" height="64"><strong>By <?php echo $photo['User']['first_name']." ".$photo['User']['last_name']; ?></strong> on <?php echo date("F jS Y",strtotime($photo['Place']['visited'])); ?> <br><?php echo $photo['Photo']['views']; ?> Views</div>
	 					<h2><?php echo $photo['Photo']['title']; ?> <span><a href="/places/view/<?php echo $photo['Place']['id']; ?>"><?php echo $photo['Place']['name']; ?></a> in <?php echo $photo['Place']['city'] . ", " . $photo['Place']['state']; ?> </span></h2>
	 				
	 				<?php
	 					if($photo['Photo']['width']< 1000){
	 				?>
	 					<div class="instagram"><img src="<?php echo $photo['Photo']['url']; ?>" width="<?php echo $photo['Photo']['width']; ?>" height="<?php echo $photo['Photo']['height']; ?>"></div>
	 					
	 				<?php }else{ ?>
	 				
	 					<img src="<?php echo $photo['Photo']['url']; ?>" width="985" height="<?php echo $photo['Photo']['height']*0.9619140625; ?>">
	 				<?php } ?>	
	 					<div class="photoInfo clearfix">
	 					
	 						<div class="caption"><p><?php echo str_replace("\r\n\r\n", "</p>\r\n<p>", $photo['Photo']['caption']); ?></p> 
	 						
	 								<?php if(!empty($currentUser)){
	 									echo "<div id='tagsToggle'><a href='#'>Show Tags</a></div>";
	 									echo "<div class='showHideAddTags'>";
					 					echo $this->Form->create('Tag', array('url'=>$html->url('/tags/add')));
					 					echo $this->Form->input('Photo.id', array('type' => 'hidden', 'value'=>$photo['Photo']['id'], 'div' => false)); 

										echo $this->Form->input('Tags.tag',  array('multiple' => 'multiple', 'class' => 'selectMultiple')); 
										echo $this->Form->input('Tags.newTags'); 

										//echo $this->Form->input('Tags.tags'); 
										echo $this->Form->submit('Save Tags', array('id' => 'saveTags')); 
	
	
										echo $this->Form->end();
									echo "</div>";		
								 } ?></div>
							
							<?php  if(!empty($photo['Tag'])){ //debug($photo['Tag']); ?>
							<div class="tags">
								<?php
									foreach($photo['Tag'] as $tag){ ?>
								<a href="/photos/tags/<?php echo $tag['tag']; ?>"><?php echo $tag['tag']; ?></a>
									<?php } ?>
								
								
							</div>
							<?php } ?>	
							<div class="photoPrevNext">
								<div class="photoPrev">
									<?php if(!empty($prev['Photo']['id'])){ ?>
									<a href="/photos/<?php echo $prev['Photo']['id']; ?>"><img src="<?php echo $prev['Photo']['thumbnail']; ?>"></a>
									<a href="/photos/<?php echo $prev['Photo']['id']; ?>">&laquo; Older Photo</a>
									<?php }else{ ?>
									<img src="/img/oldestPhoto.png">
									<?php } ?>
								</div>
								<div class="photoNext">
									<?php if(!empty($next['Photo']['id'])){ ?>
									<a href="/photos/<?php echo $next['Photo']['id']; ?>"><img src="<?php echo $next['Photo']['thumbnail']; ?>"></a>
									<a href="/photos/<?php echo $next['Photo']['id']; ?>">Newer Photo &raquo;</a>
									<?php }else{ ?>
									<img src="/img/newestPhoto.png">
									<?php } ?>
								</div>
							</div>
							
	 					</div>
	 			<?php  if(!empty($relatedPhotos)){ ?>
	 			<div class="photos clearfix">
					<h3>Other Photos Taken Near Here</h3>
				
 					<ul>
 						<?php  foreach($relatedPhotos as $related): ?>
 						<li><a href="/photos/<?php echo $related['Photo']['id']; ?>"><img src="<?php echo $related['Photo']['thumbnail']; ?>"></a></li>
 						<?php endforeach; ?>
 						
 					</ul>
 				</div> 	
 				<?php } ?>				
	 	
	 				</div>
	 				<div class="photoComments">
	 					<!-- START: Livefyre Embed -->
						<script type='text/javascript' src='http://zor.livefyre.com/wjs/v1.0/javascripts/livefyre_init.js'></script>
						<script type='text/javascript'>
						    var fyre = LF({
						        site_id: 302971
						    });
						</script>
						<!-- END: Livefyre Embed -->
                    
	 				
	 				
	 					<?php //echo $facebook->comments(array('width' => '660', 'height' => '300')); ?>
					</div>
	 			</div>
	 			
	 			
	 