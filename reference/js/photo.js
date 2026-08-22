$(document).ready(function() {


	
	$('#tagsToggle a').click( function(){
		$('#tagsToggle').hide(); 
		$('.showHideAddTags').slideDown();
		return false;
	});
});