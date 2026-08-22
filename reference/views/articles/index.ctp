<?php 
	$this->Html->script('articleIndex', false);
	//debug($articles); die;
	/*
?>
				<div id="fullWidth" class="articleIndex">
					<h2>Articles</h2>
					<div class="articlePreview large">
	 					<?php if(empty($articles[0]['Photo'][0]['url'])){ $articles[0]['Photo'][0]['url']="/img/no_thumb.jpg"; } ?>
		 					<a href="/articles/view/<?php echo $articles[0]['Article']['id']; ?>">
		 						<img src="<?php echo $articles[0]['Photo'][0]['url']; ?>" width="995" border="0">
		 					</a>
		 					<div class="articleInfo">
		 						<h3><a href="/articles/view/<?php echo $articles[0]['Article']['id']; ?>"><?php echo $articles[0]['Article']['title']; ?></a></h3>
		 						<span>By <?php echo $this->Html->link($articles[0]['User']['first_name']." ".$articles[0]['User']['last_name'], array('controller' => 'users', 'action' => 'view', $articles[0]['User']['id'])); ?> <?php echo date("F jS Y",strtotime($articles[0]['Article']['created'])); ?></span>
		 						<p><?php echo $articles[0]['Article']['abstract']; ?></p>
		 					</div>
		 					
	 					</div>
					
					
				</div>
<?php */ ?>
	
				<div id="fullWidth" class="articleIndex">
				
				<?php if(!empty($this->passedArgs[0]) and $this->passedArgs[0]=='date'){ ?>
					<h2>Articles <span>by date added</span></h2>
					<div id="sorter">or <a href="/articles/">View them by the date We visited them</a></div>
				<?php }elseif(!empty($this->passedArgs[0]) and $this->passedArgs[0]=='month'){ ?>
					<h2>Articles <span>from <?php echo date( 'F', mktime(0, 0, 0, $this->passedArgs[1]) ); ?></span></h2>
					<div id="sorter">or <a href="/articles/date/">View them in the order we put them on the site</a></div>
				<?php }elseif(!empty($this->passedArgs[0]) and $this->passedArgs[0]=='state'){ ?>
					<h2>Articles <span>in <?php echo $this->passedArgs[1]; ?> </span></h2>
					<div id="sorter">or <a href="/articles/date/">View them in the order we put them on the site</a></div>
				<?php }elseif(!empty($this->passedArgs[0]) and $this->passedArgs[0]=='author'){ ?>
					<h2>Articles <span>by <?php echo $this->passedArgs[1]; ?></span></h2>
					<div id="sorter">or <a href="/articles/date/">View them in the order we put them on the site</a></div>
				<?php }else{ ?>
					<h2>Articles <span>by date Visited</span></h2>
					<div id="sorter">or <a href="/articles/date/">View them in the order we put them on the site</a></div>
				<?php } ?>
						
	 					
	 					
				</div>
				<div id="leftCol" class="articleIndex">
	 				
	 				
	 				<?php foreach ($articles as $article){  ?>
	 					<div class="articlePreview">
	 					<?php if(empty($article['Photo'][0]['url'])){ $article['Photo'][0]['url']="/img/no_thumb.jpg"; } ?>
		 					<a href="/articles/<?php echo $article['Article']['id']; ?>">
		 					<?php if(!empty($article['Photo'][0]['med'])){ ?>
		 						<img src="<?php echo $article['Photo'][0]['med']; ?>" width="595" height="<?php echo floor($article['Photo'][0]['height']/1.72); ?>" border="0">
		 					<?php }else{ ?>
		 						<img src="<?php echo $article['Photo'][0]['url']; ?>" width="595" height="<?php echo floor($article['Photo'][0]['height']/1.72); ?>" border="0">
		 					<?php } ?>
		 					</a>
		 					<div class="articleInfo">
		 						<h3><a href="/articles/<?php echo $article['Article']['id']; ?>"><?php echo $article['Article']['title']; ?></a></h3>
		 						<span>By <strong><?php echo $article['User']['first_name']." ".$article['User']['last_name']; ?></strong> <?php echo date("F jS Y",strtotime($article['Place'][0]['visited'])); ?></span>
		 						<p><?php echo $article['Article']['abstract']; ?></p>
		 					</div>
		 					
	 					</div>
	 					<?php  } ?>
	 					
						<div class="paging">
							<?php echo $this->Paginator->prev('<< ' . __('previous', true), array(), null, array('class'=>'disabled'));?> |
						    <?php echo $this->Paginator->numbers();?> |
							<?php echo $this->Paginator->next(__('next', true) . ' >>', array(), null, array('class' => 'disabled'));?>
						</div>

	 			</div>
	 			<div id="rightCol">
	 			
	 			 	<div class="filter">
		 				<h3>Slice and Dice It!</h3>
		 				<p>You can change up how you view the articles here.</p>
		 				
		 				<form>
		 					<ul>
		 						<li>
		 							<label for="filterState">By State</label>
		 							<select name="state" id="filterState">
		 								<option value="">Choose One</option>
		 								<option value="CA">California</option>
		 								<option value="AZ">Arizona</option>
		 								<option value="NM">New Mexico</option>
		 								<option value="TX">Texas</option>
		 								<option value="LA">Louisiana</option>
		 								<option value="MS">Mississippi</option>
		 								<option value="AL">Alabama</option>
		 								<option value="FL">Florida</option>
		 								<option value="GA">Georgia</option>
		 								<option value="SC">South Carolina</option>
		 								<option value="NC">North Carolina</option>
		 								<option value="TN">Tennessee</option>
		 								<option value="AR">Arkansas</option>
		 								<option value="KY">Kentucky</option>
		 								<option value="MO">Missouri</option>
		 								<option value="IL">Illinois</option>
		 								<option value="IN">Indiana</option>
		 								<option value="MI">Michigan</option>
		 								<option value="WI">Wisconsin</option>
		 								<option value="IA">Iowa</option>
		 								<option value="KS">Kansas</option>
		 								<option value="OK">Oklahoma</option>
		 							</select>
		 						</li>
		 						<li>
		 							<label for="filterMonth">By Month</label>
		 							<select name="month" id="filterMonth">
		 								<option value="">Choose One</option>
		 								<option value="01">January</option>
		 								<option value="02">February</option>
		 								<option value="03">March</option>
		 								<option value="04">April</option>
		 								<option value="05">May</option>
		 								<option value="06">June</option>
		 								
		 							</select>
		 						</li>
		 						<li>
		 							<label for="filterAuthor">By Author</label>
		 							<select name="author" id="filterAuthor">
		 								<option value="">Choose One</option>
		 								<option value="paul">Paul</option>
		 								<option value="alana">Alana</option>
		 							</select>
		 						</li>
		 					</ul>
		 				</form>
	 				</div> 
	 			</div>

<?php /*
				<div id="fullWidth">
	 				<div class="articleIndex">



	 					<h2>Articles</h2>
	 					
	 					<?php foreach ($articles as $article): ?>
	 					<div class="articleItem">
	 					<?php if(empty($article['Photo'][0]['thumbnail'])){ $article['Photo'][0]['thumbnail']="/img/no_thumb.jpg"; } ?>
		 					<a href="/articles/view/<?php echo $article['Article']['id']; ?>"><img src="<?php echo $article['Photo'][0]['thumbnail']; ?>" width="120" height="120"></a>
		 					<div>
		 						<h3><a href="/articles/view/<?php echo $article['Article']['id']; ?>"><?php echo $article['Article']['title']; ?></a></h3>
		 						<span>By <?php echo $this->Html->link($article['User']['first_name']." ".$article['User']['last_name'], array('controller' => 'users', 'action' => 'view', $article['User']['id'])); ?> <?php echo date("F jS Y",strtotime($article['Article']['created'])); ?></span>
		 						<p><?php echo $article['Article']['abstract']; ?></p>
		 					</div>
	 					</div>
	 					<?php endforeach; ?>
	 	
	 				</div>
	 			</div>

*/ ?>


