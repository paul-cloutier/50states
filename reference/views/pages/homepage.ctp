<?php 
	$mapsApiUrl = 'http://maps.google.com/maps/api/js?sensor=false';
	if (!empty($googleMapsApiKey)) { $mapsApiUrl .= '&amp;key=' . $googleMapsApiKey; }
	echo $this->Html->script($mapsApiUrl, false);
		
	echo $this->Html->script('infobox_packed', false);
	echo $this->Html->script('jquery.json-2.2.min', false);
	echo '<script type="text/javascript" src="/js/homemap.js?v=2"></script>';
	
	//debug($recentPhotos); 
	
?>
				
 				<div class="clearfix">
					<div id="leftCol">
					
					
		 				<div class="recentPost">
		 				
		 					<h2><?php echo $recentArticle['Article']['title']; ?></h2>
		 					<div class="subTitle">
		 						<?php echo $recentArticle['Article']['abstract']; ?>
		 					</div>
		 					
		 					<?php if(!empty($recentArticle['Photo'])){ ?>
		 					
		 						<?php if(!empty($recentArticle['Photo'][0]['med'])){ ?>
		 					<a href="/articles/<?php echo $recentArticle['Article']['id']; ?>"><img src="<?php echo $recentArticle['Photo'][0]['med']; ?>" width="590" height="<?php echo floor($recentArticle['Photo'][0]['height']/1.735); ?>" ></a>
		 						<?php }else{ ?>
		 					<a href="/articles/<?php echo $recentArticle['Article']['id']; ?>"><img src="<?php echo $recentArticle['Photo'][0]['url']; ?>" width="590" height="<?php echo floor($recentArticle['Photo'][0]['height']/1.735); ?>" ></a>
		 						<?php } ?>
		 					<?php } ?>
		 					
		 					<?php if(!empty($recentArticle['ArticleBlurb'])){ ?>
		 					
		 					<div class="postBody">
								<p><?php 
									//echo str_replace("\r\n\r\n", "</p>\r\n<p>", $recentArticle['ArticleBlurb'][0]['blurb']); 
									echo substr($recentArticle['ArticleBlurb'][0]['blurb'], 0, stripos($recentArticle['ArticleBlurb'][0]['blurb'], "\r\n\r\n") );
									?></p>
		 					</div>
		 					
		 					<?php } ?>
		 					
		 					<div class="showAll"><a href="/articles/<?php echo $recentArticle['Article']['id']; ?>">Read the whole thing &raquo;</a></div>
		 	
		 				</div>
		 			</div>
		 			<div id="rightCol">
		 				
		 				<?php echo $this->element('tweets'); /*
		 				
		 				<div class="tweets">
		 					<h3>Updates</h3>
		 					<ul>
		 					
		 					<?php foreach($tweets as $tweet): //debug($tweet); ?>
		 						<li class="<?php echo $tweet['name']; ?>">
			 						<img src="/img/<?php echo $tweet['name']; ?>_avatar_small.jpg" width="64" height="64">
			 						<div>
			 							<?php echo $tweet['title']; ?>
			 						</div>
		 						</li>
		 						<?php endforeach; ?>
		 						
		 					</ul>
		 					
		 				</div>
		 				 */ ?>
		 				<div class="twitterLinks">
	 						<ul>
	 							<li class="left"><a href="http://www.twitter.com/theorem/" target="_blank>">View Paul on Twitter &raquo;</a></li>
	 							<li class="right"><a href="http://www.twitter.com/kittyholmes/" target="_blank>">View Alana on Twitter &raquo;</a></li>
	 						</ul>
	 					</div>
		 				
		 				
		 			</div>
				</div>
	 			<div class="photos clearfix">
					<div class="showAll"><a href="/photos/date">See All Photos &raquo;</a></div>
					<h3>Recent Photos</h3>
				
 					<ul>
 						<?php foreach($recentPhotos as $photo): ?>
 						<li><a href="/photos/<?php echo $photo['Photo']['id']; ?>"><img src="<?php echo $photo['Photo']['thumbnail']; ?>"></a></li>
 						<?php endforeach; ?>
 						
 					</ul>
 				</div>