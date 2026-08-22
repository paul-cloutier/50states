<?php 
	/*$startDate = new DateTime(20110109);
	$curDate = new DateTime(date('Ymd'));
	
	$interval = $startDate->diff($curDate);*/
	
	$days = round((strtotime(date("Y-m-d")) - strtotime("2011-01-09")) / (60 * 60 * 24));

?>				<div id="homeStats">
					<div class="inner">
						<ul>
							<li>Miles Traveled <span>19651</span></li>
							<li>Days On The Road <span> 240</span></li>
							<li>Gallons Of Gas Used <span><?php echo 188+(1532);?></span></li>
							<li>Cars Passed <span>8</span></li>
							<li>States Visited <span>28</span></li>
						</ul>
					</div>
				</div>