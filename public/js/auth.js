(function(window) {
	window.auth = {
		userKey: 'EMBY.USER',
		login: function(userName) {
			console.dir(userName);
			localStorage.setItem(
				auth.userKey,
				JSON.stringify({
					userName: userName,
				})
			);
			page('/home');
		},
		logout: function() {
			localStorage.removeItem(auth.userKey);
			page('/login');
		}
	};
})(window);
