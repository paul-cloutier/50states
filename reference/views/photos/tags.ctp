<?php 
	//$this->Html->script('articleAdd', false);
	//debug($photos);
?>
				<div id="fullWidth">
	 				<div class="photoIndex">

						
						
							<h2>Photos <span>tagged with <?php echo $tag; ?></span></h2>
							
						
	 					
	 					
	 					<?php $i=1; $total = count($photos);  foreach ($photos as $photo): 
	 						if($i == 1 or $i == 5 or $i == 9){ echo "<div class='row clearfix'>";}
	 					?>
	 					<div class="photoItem">
	 					
		 					<a href="/photos/<?php echo $photo['Photo']['id']; ?>"><img src="<?php echo $photo['Photo']['thumbnail']; ?>" width="200" height="200"></a>
		 					<div>
		 						<h3><a href="/photos/<?php echo $photo['Photo']['id']; ?>"><?php echo $photo['Photo']['title']; ?></a></h3>
		 						<span>By <?php echo $this->Html->link($photo['User']['first_name'], array('controller' => 'users', 'action' => 'view', $photo['User']['id'])); ?> <?php echo date("F jS Y",strtotime($photo['Place']['visited'])); ?></span>
		 						
		 					</div>
	 					</div>
	 					
	 					<?php if($i == 4 or $i == 8 or $i == 12 or $i == $total){ echo "</div>";} $i++; endforeach; ?>
	 	
	 				</div>
	 				
	 				
	 				
				
					<div class="paging">
						<div class="paginateLeft">
							<?php //echo $this->Paginator->prev('<< Newer Photos', array(), null, array('class'=>'disabled'));?>
							
							 <?php $prev_link = str_replace('page:', '', $paginator->prev('<< Newer Photos')); ?>
							 <?php $prev_link = preg_replace('/\/1"/', '"', $prev_link); ?>
							 <?php echo $prev_link; ?> 
						</div>
						<div class="pageCounter">
							<?php echo $this->Paginator->counter(array('format' => __('Showing Page <span>%page%</span> of <span>%pages%</span>', true)));?>
						</div>
						<div class="paginateRight">
							<?php //echo $this->Paginator->next('Older Photos >>', array(), null, array('class' => 'disabled'));?>
							 <?php $next_link = str_replace('page:', '', $paginator->next('Older Photos >>')); ?>
							 <?php $next_link = preg_replace('/\/1"/', '"', $next_link); ?>
							 <?php echo $next_link; ?> 
						</div>
					</div>
	
	 			</div>





