(function () {

    document.addEventListener("viewinit-defaulttheme-movies", function (e) {

        new musicPage(e.detail.element, e.detail.params);
    });

    function musicPage(view, params) {

        var self = this;
        var itemPromise;

        view.addEventListener('viewshow', function (e) {

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self, params);
                }

                itemPromise = itemPromise || Emby.Models.item(params.parentid);

                itemPromise.then(function (item) {

                    Emby.Page.setTitle(item.Name);
                    Emby.Backdrop.setBackdrops([item]);
                });
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
        });
    }

    function renderTabs(view, initialTabId, pageInstance, params) {

        var tabs = [
        {
            Name: Globalize.translate('Suggested'),
            Id: "suggested"
        },
        {
            Name: Globalize.translate('Movies'),
            Id: "movies"
        },
        {
            Name: Globalize.translate('Genres'),
            Id: "genres"
        },
        {
            Name: Globalize.translate('Collections'),
            Id: "collections"
        },
        {
            Name: Globalize.translate('Favorites'),
            Id: "favorites"
        }];

        var tabbedPage = new DefaultTheme.TabbedPage(view);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.params = params;
        tabbedPage.renderTabs(tabs, initialTabId);
        pageInstance.tabbedPage = tabbedPage;
    }

    function loadViewContent(page, id) {

        var pageParams = this.params;

        switch (id) {

            case 'movies':
                renderMovies(page, pageParams);
                break;
            case 'collections':
                renderCollections(page, pageParams);
                break;
            case 'favorites':
                renderFavorites(page, pageParams);
                break;
            case 'genres':
                renderGenres(page, pageParams);
                break;
            default:
                break;
        }
    }

    function renderGenres(page, pageParams) {

        self.tabController = new DefaultTheme.HorizontalList({

            itemsContainer: page.querySelector('.contentScrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.genres({
                    StartIndex: startIndex,
                    Limit: limit,
                    ParentId: pageParams.parentid
                });
            },
            listCountElement: page.querySelector('.listCount'),
            listNumbersElement: page.querySelector('.listNumbers')
        });

        self.tabController.render();
    }

    function renderFavorites(page, pageParams) {

        self.tabController = new DefaultTheme.HorizontalList({

            itemsContainer: page.querySelector('.contentScrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.items({
                    StartIndex: startIndex,
                    Limit: limit,
                    ParentId: pageParams.parentid,
                    IncludeItemTypes: "Movie",
                    Recursive: true,
                    Filters: "IsFavorite"
                });
            },
            listCountElement: page.querySelector('.listCount'),
            listNumbersElement: page.querySelector('.listNumbers')
        });

        self.tabController.render();
    }

    function renderMovies(page, pageParams) {

        self.tabController = new DefaultTheme.HorizontalList({

            itemsContainer: page.querySelector('.contentScrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.items({
                    StartIndex: startIndex,
                    Limit: limit,
                    ParentId: pageParams.parentid,
                    IncludeItemTypes: "Movie",
                    Recursive: true
                });
            },
            listCountElement: page.querySelector('.listCount'),
            listNumbersElement: page.querySelector('.listNumbers')
        });

        self.tabController.render();
    }

    function renderCollections(page, pageParams) {

        self.tabController = new DefaultTheme.HorizontalList({

            itemsContainer: page.querySelector('.contentScrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.collections({
                    StartIndex: startIndex,
                    Limit: limit
                });
            },
            listCountElement: page.querySelector('.listCount'),
            listNumbersElement: page.querySelector('.listNumbers')
        });

        self.tabController.render();
    }

})();