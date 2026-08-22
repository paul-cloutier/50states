


				<div id="fullWidth">
	 				<div class="login">
						<?php echo $this->Session->flash('auth');   
						echo $form->create('User', array('action' => 'login')); ?>
	 					<ul class="loginForm">
	 					
	 						<li><?php echo $form->input('User.username', array('div' => false, 'class'=>'logInput'));?></li>
	 						<li><?php echo $form->input('User.password', array('div' => false, 'class'=>'logInput'));?></li>
	 						<li class="submit"><input type="image" src="/img/btn_log_in.png" value="Log In"></li>
	 						
	 					</ul>
	 					
	 					<?php echo $form->end();?>
			 		</div>
			 	</div>