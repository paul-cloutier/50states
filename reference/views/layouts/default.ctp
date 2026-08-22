<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

	<head>
		<?php echo $this->Html->charset(); ?>
		<meta name="viewport" content="width=1024;">
		
		
		<title>50 States Or Less: <?php echo $title_for_layout; ?></title>
		
	<?php
		echo $this->Html->meta('icon');
		echo $this->Html->script('jquery-1.4.2.min');
		echo $this->Html->script('common');
		echo $this->Html->css('style');

		echo $scripts_for_layout;
	?>
	<?php if (empty($this->currentUser)) { ?>
	<script type="text/javascript">
	
	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-21209848-1']);
	  _gaq.push(['_trackPageview']);
	
	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();
	
	</script>
	
	<?php } ?>
	
	</head>
	<body>
	 
	 	<div class="header">
	 		<div class="inner">
	 			<h1><a href="/">50 States... Or Less</a></h1>
	 			<ul>
	 				<li<?php if($this->name=="Articles"){echo ' class="selected"'; }?>><a href="/articles/date">Articles</a></li>
	 				<li<?php if($this->name=="Photos"){echo ' class="selected"'; }?>><a href="/photos/date">Photos</a></li>
	 				<li><a href="/articles/1">The RV</a></li>
	 				<!-- <li><a href="#">Where To Next?</a></li> -->
	 			</ul>
	 		</div>
	 	</div>
	 	
	 	<?php 
	 	if($this->name=="Articles" && $this->action=="view"){
	 		echo $this->element('articleMap');
	 	}elseif($this->name=="Pages" && $this->action=="homepage"){
	 		echo $this->element('homeMap');
	 		echo $this->element('homeStats');
	 	}elseif($this->name=="Pages" && $this->params['url']['url']=="coming_soon"){
	 		echo $this->element('homeMap');
	 	}
	 	
	 	 ?>

	 	<div class="main">
	 		<div class="inner">
	 			
	 			
	 			<?php echo $this->Session->flash(); ?>

				<?php echo $content_for_layout; ?>
	 			
	 		</div>
	 	</div>
	 	
	 	

	
	 	<div class="footer">
	 		<div class="inner">
	 			
	 			<p class="about">Realizing that they both really just wanted to travel and take pictures, Paul and Alana decided to get rid of all their stuff and hit the road for a year in a 1977 GMC Motorhome that they restored from the ground up. This is their trip.</p>
 				
 				<ul class="bios clearfix">

	 				<li class="left">
	 					<img src="/img/paul_avatar_small.jpg" width="100" height="100">
	 					<h4>Paul Cloutier</h4>
	 					<p>Paul loves to drive and spends more time looking for the worlds largest X than he probably should. He's pretty excited about Kentucky bourbon tours and finally seeing New England.</p>
	 					<p>Write 
	 					<script type="text/javascript">
							document.write("<n uers=\"znvygb:cnhy@50fgngrfbeyrff.pbz\" ery=\"absbyybj\">cnhy@50fgngrfbeyrff.pbz</n>".replace(/[a-zA-Z]/g, 
							function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);}));
						</script>
							 					
	 					to reach him.</p>
	 				</li>
	 				<li class="right">
	 					<img src="/img/alana_avatar_small.jpg" width="100" height="100">
	 					<h4>Alana Cloutier</h4>
	 					<p>Alana is only taking pictures on this trip with an iPhone and spends a lot of time hiding the dog when we go places. She's pretty excited about seeing as many donut shops as possible.</p>
	 					<p>Write <script type="text/javascript">
							document.write("<n uers=\"znvygb:nynan@50fgngrfbeyrff.pbz\" ery=\"absbyybj\">nynan@50fgngrfbeyrff.pbz</n>".replace(/[a-zA-Z]/g, 
							function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);}));
						</script> to reach her.</p>
	 				</li>
	 				
 				</ul>
	 			
	 		</div>
	 	</div>
	 	<?php echo $this->element('sql_dump'); ?>
	 	
	 </body>
</html>