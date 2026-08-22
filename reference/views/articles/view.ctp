<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
		
	echo $this->Html->script('infobox_packed', false);
	echo $this->Html->script('jquery.json-2.2.min', false);
	echo $this->Html->script('article', false);
	
	//debug($prev); 
	//debug($next); 
?>

				<div id="fullWidth">
	 				<div class="article">

	 					<h2><?php echo $article['Article']['title']; ?></h2>
	 					<div class="subTitle">
	 						<?php echo $article['Article']['abstract']; ?>
	 					</div>
	 					
 						<script>
							var locationData = {"locations": [
						<?php
							
							foreach($article['Place'] as $location):
							?>
							{"latlong": "<?php echo $location['lat'];?>,<?php echo $location['long'];?>"},

						<?php  endforeach; ?>
						 ]
							};
						</script>
							
	 					
	 					<?php $i = 0; foreach($article['ArticleBlurb'] as $blurb): ?>
	 					
	 					<?php if(!empty($article['Photo'][$i])): ?>
	 						<a href="/photos/<?php echo $article['Photo'][$i]['id']; ?>"><img src="<?php echo $article['Photo'][$i]['url']; ?>" width="<?php echo $article['Photo'][$i]['width']; ?>" height="<?php echo $article['Photo'][$i]['height']; ?>"></a>
	 					<?php endif; ?>
	 					
	 					<div class="postBody">
	 					<?php if(!empty($article['Photo'][$i])): ?>
							<div class="caption"><strong><?php echo $article['Photo'][$i]['title']; ?></strong> <?php echo $article['Photo'][$i]['caption']; ?></div>

	 					<?php endif; ?>
	 					
							<?php echo $html->formatBlurb($blurb['blurb']); ?>

	 					</div>
	 						
	 						
	 					<?php $i++; endforeach; ?>
	 					
	 					
	 					
	 					
	 					
	 					
	 		<?php /*	<div class="photos clearfix">
					<h3>Other Photos Here</h3>
				
 					<ul>
 						<?php foreach($otherPhotos as $photo): ?>
 						<li><a href="/photos/view/<?php echo $photo['Photo']['id']; ?>"><img src="<?php echo $photo['Photo']['thumbnail']; ?>"></a></li>
 						<?php endforeach; ?>
 						
 					</ul>
 				</div> */ ?>
	 	
	 				</div>
	 				
	 				
	 				<div class="nextPrev">
	 					
	 					<?php if(!empty($prev)){ ?>
	 					<div class="left"> 
	 						<div>&laquo; Previous Article</div>
	 						<a href="/articles/<?php echo $prev['Article']['id']; ?>">
	 							<div class="thumbFloat"><img src="<?php echo $prev['Photo'][0]['thumbnail']; ?>" width="100" height="100"></div>
	 						
			 					
			 					<h4><?php echo $prev['Article']['title']; ?></h4>
			 					<div class="byLine"><?php echo $prev['Place'][0]['city']; ?>, <?php echo $prev['Place'][0]['state']; ?></div>
			 					<div class="subTitle"><?php echo $prev['Article']['abstract']; ?></div>
			 					
			 					
			 					
			 				</a>
	 					</div>
	 					<?php }else{ ?>
	 						<div class="left">
	 				 			<div class="inactive">&laquo; Previous Article</div>
			 					
			 					<div class="thumbFloatOff"><img src="/img/first_article.png" width="100" height="100"></div>
	 						
	 					</div>
	 					<?php }
	 					
	 					if(!empty($next)){ ?>
	 				 	<div class="right">
	 				 		<div>Next Article &raquo;</div>
			 				<a href="/articles/<?php echo $next['Article']['id']; ?>">
			 					
			 					<div class="thumbFloat"><img src="<?php echo $next['Photo'][0]['thumbnail']; ?>" width="100" height="100"></div>
	 						

			 					<h4><?php echo $next['Article']['title']; ?></h4>
			 					<div class="byLine"><?php echo $next['Place'][0]['city']; ?>, <?php echo $next['Place'][0]['state']; ?></div>

			 					<div class="subTitle"><?php echo $next['Article']['abstract']; ?></div>
			 					
			 					
			 				</a>
	 					</div>
	 					<?php }else{ ?>
	 						<div class="right">
	 				 			<div class="inactive">Next Article &raquo;</div>
			 					
			 					<div class="thumbFloatOff"><img src="/img/last_article.png" width="100" height="100"></div>
	 						
	 					</div>
	 					<?php } ?>
	 					
 					</div>
 					<div class="articleComments">
 						<?php //echo $facebook->comments(array('width' => '660', 'height' => '300')); ?>
 						<!-- START: Livefyre Embed -->
						<script type='text/javascript' src='http://zor.livefyre.com/wjs/v1.0/javascripts/livefyre_init.js'></script>
						<script type='text/javascript'>
						    var fyre = LF({
						        site_id: 302971
						    });
						</script>
						<!-- END: Livefyre Embed -->
					</div>
						                    
 				</div>
 			</div>





