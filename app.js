// Define core routes
page('*', init.ctx);
page('*', init.auth);
page('/login', route.login);

// Define theme routes - theme object should have a method to return these so that the theme doesn't have to work with page.js
// In addition, the theme can list out dependencies for each route and we can pass them into require() before loading it
// When theme js is loaded it will call ObjectManager.register (see objects.js)
// Then we'll figure out which theme to load and call a method on it to get it's route list
page('/home', route.home);
page('/movies', route.movies);
page('*', render.content);

// There will be an async call here. Depending on the result we will either call page(), bounce to login, or bounce to startup wizard
// Or do we call page() and then do our logic? Probably need to learn more page.js first
page();
