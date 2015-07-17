(function (globalScope, document) {

	var lastInputTime = new Date().getTime();
	
    function idleTime() {
		return new Date().getTime() - lastInputTime;
	}
	
	document.addEventListener('click', function(){
		lastInputTime = new Date().getTime();
	});
	
	document.addEventListener('mousemove', function(){
		lastInputTime = new Date().getTime();
	});
	
	document.addEventListener('keydown', function(){
		lastInputTime = new Date().getTime();
	});

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.InputManager = {
        idleTime: idleTime
    };

})(this, document);
