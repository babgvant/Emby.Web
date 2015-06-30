(function(document, window) {
	var navItems = document.querySelectorAll('#navigation li');
	var navLinks = document.querySelectorAll('#navigation a');

	for (var i = 0; i < navLinks.length; i++) {
		navLinks[i].addEventListener('click', function() {
			var index = [].slice.call(navItems).indexOf(this.parentNode);
			changeActive(index);
		}, false);
	}

	window.changeActive = function (index) {
		for (var i = 0; i < navLinks.length; i++) {
			if (i === index)
				navLinks[i].classList.add('active');
			else
				navLinks[i].classList.remove('active');
		}
	}
})(document, window);
