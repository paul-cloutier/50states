

<?php 
	if (!empty($articles)) {
		if($articles=="fail"){
			echo $articles;
		}else{
			//echo $this->Js->object($vehicles);
			$i=1;
			$totalArticles = count($articles);
echo '{
	"articles": [';
	foreach($articles as $article){
		if(!empty($article['ArticleLocation'][0]['location'])){
			echo '
			{
			"title": "'.$article['Article']['title'].'",
			"id": "'.$article['Article']['id'].'",
			"visited": "'.$article[0]['visited'].'",
			"location": "'.$article['ArticleLocation'][0]['location'].'",
			"cityState": "'.$article['ArticleLocation'][0]['city'].', '.$article['ArticleLocation'][0]['state'].'",
			"author": "'.$article['User']['first_name']. ' '.$article['User']['last_name']; if($totalArticles==$i){echo '"}';}else{echo '"},';}
		}
		$i++;
	}	
echo ']}';
		
		}
	}
?>