(function(document, window) {
	// Private
	var cache = {},
		contentEl = document.getElementById('content'),
		user;

	function get (url, cb) {
		if (cache[url]) return cb(cache[url]);

		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				var data = request.responseText;
				cache[url] = data;
				cb(data);
			} else {
				// Server returned error
			}
		};
		request.onerror = function() {
			// Connection error
		};
		request.send();
	}

	// Public
	window.init = {
		auth: function(ctx, next) {
			if (user) {
				next();
				return;
			}

			var userCached = localStorage.getItem(auth.userKey);
			if (userCached) {
				user = JSON.parse(userCached);
				next();
				return;
			}

			if (ctx.pathname !== '/login')
				page.redirect('/login');
			else
				next();
		},
		ctx: function(ctx, next) {
			ctx.data = {};
			ctx.partials = {};
			if (ctx.init) {
				next();
			} else {
				contentEl.classList.add('transition');
				setTimeout(function() {
					content.classList.remove('transition');
					next();
				}, 300);
			}
		}
	};

	window.route = {
		login: function (ctx, next) {
			get('views/login.html', function (html) {
				ctx.data.index = -1;
				ctx.partials.content = html;
				next();
			});
		},
		home: function(ctx, next) {
			get('views/home.html', function (html) {
				ctx.data.index = 0;
				ctx.data.name = user.userName;
				ctx.partials.content = html;
				next();
			});
		},
		movies: function (ctx, next) {
			get('views/movies.html', function (html) {
				ctx.data.index = 1;
				ctx.data.name = user.userName;
				ctx.partials.content = html;
				next();
			});
		}
	};

	window.render = {
		content: function (ctx, next) {
			get('views/content.html', function (html) {
				var template = Hogan.compile(html),
					content = template.render(ctx.data, ctx.partials);
				contentEl.innerHTML = content;
				changeActive(ctx.data.index);
				if (typeof done === 'function') done(ctx.data.index);
			});
		}
	};

	window.done = null;
})(document, window);
