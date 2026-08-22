<?php 
	//$this->Html->script('articleAdd', false);
	//debug($photos);

?>
				<div id="fullWidth">
	 				<div class="photoIndex">

						
						<?php if(!empty($this->passedArgs[0]) and $this->passedArgs[0]=='date'){ ?>
							<h2>Photos <span>by date added</span></h2>
							<div id="sorter">or <a href="/photos/">View them by the date We visited them</a></div>
						<?php }else{ ?>
							<h2>Photos <span>by date Visited</span></h2>
							<div id="sorter">or <a href="/photos/date/">View them in the order we put them on the site</a></div>
						<?php } ?>
						
	 					
	 					
	 					<?php $i=1; foreach ($photos as $photo): 
	 						if($i == 1 or $i == 5 or $i == 9){ echo "<div class='row clearfix'>";}
	 					?>
	 					<div class="photoItem">
	 					
		 					<a href="/photos/<?php echo $photo['Photo']['id']; ?>"><img src="<?php echo $photo['Photo']['thumbnail']; ?>" width="200" height="200"></a>
		 					<div>
		 						<h3><a href="/photos/<?php echo $photo['Photo']['id']; ?>"><?php echo $photo['Photo']['title']; ?></a></h3>
		 						<span>By <?php echo $this->Html->link($photo['User']['first_name'], array('controller' => 'users', 'action' => 'view', $photo['User']['id'])); ?> <?php echo date("F jS Y",strtotime($photo['Place']['visited'])); ?></span>
		 						
		 					</div>
	 					</div>
	 					
	 					<?php if($i == 4 or $i == 8 or $i == 12){ echo "</div>";} $i++; endforeach; ?>
	 	
	 				</div>
	 				
	 				
	 				
				
					<div class="paging">
						<div class="paginateLeft">
							<?php echo $this->Paginator->prev('<< Newer Photos', array(), null, array('class'=>'disabled'));?>
						</div>
						<div class="pageCounter">
							<?php echo $this->Paginator->counter(array('format' => __('Showing Page <span>%page%</span> of <span>%pages%</span>', true)));?>
						</div>
						<div class="paginateRight">
							<?php echo $this->Paginator->next('Older Photos >>', array(), null, array('class' => 'disabled'));?>
						</div>
					</div>
	
	 			</div>





