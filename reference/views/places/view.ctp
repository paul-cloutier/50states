<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
		
	echo $this->Html->script('jquery.json-2.2.min', false);
	echo $this->Html->script('place', false);
	
	//debug($recentPhotos); 
	
?>
				
 				<div class="clearfix" id="place">
	 				<h2><span>PLACE</span> <?php echo $place['Place']['name']; ?></h2>
					<div id="leftCol">
					
						<div class="placeMapper">
							<div id="mapCanvas"></div>
							<div class="showAll"><a href="http://maps.google.com/maps?q=<?php echo $place['Place']['lat']; ?>,<?php echo $place['Place']['long']; ?>" target="_blank">Open in Google Maps &raquo;</a></div>
							<p class="placeAddress">
								<?php echo $place['Place']['address']; ?><br>
								<?php echo $place['Place']['city']; ?>, <?php echo $place['Place']['state']; ?> <?php echo $place['Place']['zip']; ?><br>
							</p>
							<p class="invisible" id="placeLatLong"><?php echo $place['Place']['lat']; ?>,<?php echo $place['Place']['long']; ?></p>
							<?php if(!empty($place['Place']['website'])){ ?><p class="url">
								<a href="<?php echo $place['Place']['website']; ?>" target="_blank"><?php echo $place['Place']['website']; ?></a>
							</p> <?php } ?>
							<?php if(!empty($place['Place']['website'])){ ?><p class="description">
								<?php echo $place['Place']['description']; ?>
							</p> <?php } ?>
								
							
						</div>
		 			</div>
		 			<div id="rightCol">
		 				
		 				<div class="recentPost">
		 				
		 					
		 					
		 					<?php if(!empty($place['Article'])){ ?>
		 					<?php if(!empty($place['Article'][0]['Photo'])){ ?>
		 					
		 						<?php if(!empty($place['Article'][0]['Photo'][0]['med'])){ ?>
		 					<a href="/articles/<?php echo $place['Article'][0]['id']; ?>"><img src="<?php echo $place['Article'][0]['Photo'][0]['med']; ?>" width="590" height="<?php echo floor($place['Article'][0]['Photo'][0]['height']/1.735); ?>" ></a>
		 						<?php }else{ ?>
		 					<a href="/articles/<?php echo $place['Article'][0]['id']; ?>"><img src="<?php echo $place['Article'][0]['Photo'][0]['url']; ?>" width="590" height="<?php echo floor($place['Article'][0]['Photo'][0]['height']/1.735); ?>" ></a>
		 						<?php } ?>
		 					<?php } ?>
		 					
		 					<h2><?php echo $place['Article'][0]['title']; ?></h2>
		 					<div class="subTitle">
		 						<?php echo $place['Article'][0]['abstract']; ?>
		 					</div>
		 					
		 					<?php if(!empty($place['Article'][0]['ArticleBlurb'])){  ?>
		 					
		 					<div class="postBody">
								<?php echo $html->formatBlurb($place['Article'][0]['ArticleBlurb'][0]['blurb']); ?>
		 					</div>
		 					
		 					<?php } ?>
		 					
		 					<div class="showAll"><a href="/articles/<?php echo $place['Article'][0]['id']; ?>">Read the whole thing &raquo;</a></div>
		 					<?php }else { ?>
		 						<div class="noArticle">We haven't published an article <br>for this place yet.</div>
		 					<?php } ?>
		 					
		 				</div>
		 				<?php if(!empty($place['Photo'])){ ?>
		 				<div class="photos clearfix">
							<h3>Photos Taken Here</h3>
						
		 					<ul>
		 						<?php foreach($place['Photo'] as $photo): ?>
		 						<li><a href="/photos/<?php echo $photo['id']; ?>"><img src="<?php echo $photo['thumbnail']; ?>"></a></li>
		 						<?php endforeach; ?>
		 						
		 					</ul>
		 				</div>
		 				<?php } ?>
		 			</div>
				</div>
	 			



