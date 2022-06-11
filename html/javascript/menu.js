(function(){
    window.onload = function(e){
		window.addEventListener('message', (event) => {
			onDefaultData(event.data);
			onDialogData(event.data);
		});
	};
})();