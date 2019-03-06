var app = angular.module('Comics',['ui.router','infinite-scroll']);


  app.controller("con",['$scope', function($scope){

	$scope.chooseClass = function(){
		let index = Math.floor((Math.random()*11)+1);
		
		if(index < 9){
			return $scope.class = "comic normal";
		
		}else if(index == 9){
			return $scope.class = "comic rare";
		}else if(index = 10){
			return $scope.class = "comic bestseller";
		}
	}
  }]);



app.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider.state('index', {
		url: '',
		controler: 'MainCtrl',
		templateUrl: 'templates/comic.html'
	})
	.state('index.single', {
		url: '/:id',
		templateUrl: 'templates/comicPopUp.html',
		controller: 'SingleComic'
	});
});

app.controller('MainCtrl',function($scope, ComicBooks) {	

	$scope.more = new ComicBooks.LoadMore($scope);
});

app.controller('SingleComic', function($scope, $rootScope, $stateParams, ComicBooks, $window) {
	var id = $stateParams.id;
	ComicBooks.findOne(id).then(function(result) {
		var data = result.data.results[0];
		$scope.comicName = data.title;
		$scope.comicUrl = data.urls[0].url;
		$scope.comicImg = data.thumbnail.path + '.' + data.thumbnail.extension;
		var desc = data.description;
		if(desc.length <= 0){
			desc = "No description provided";
		}
		$scope.description = desc;
		
		$rootScope.$broadcast('contentLoaded');
	});
});

app.value('$anchorScroll', angular.noop);

app.directive('popup',function() {
	var linker = function(scope,element,attrs) {
		scope.$on('contentLoaded',function() {
			element.addClass('show');
		});
		scope.close = function() {
			element.removeClass('show');
		};
	};
	return {
		restrict: 'E',
		link: linker
	};
});


app.factory('ComicBooks',function($http,$q) {
	
	var publicKey = 'f1da2ae2dc487b462dc04513dea9eac1';
	var baseUrl = 'http://gateway.marvel.com/v1/';
	var limit = 50;

	
	
	var findOne = function(id) {
		var def = $q.defer();
		var url = baseUrl + 'public/comics/format=comic&formatType=comic&hasDigitalIssue=true&' + id +'?apikey=' + publicKey;
		$http.get(url).success(def.resolve).error(def.reject);

		return def.promise;
	};
	var findNext = function(offset) {
		var def = $q.defer();
		var url = baseUrl + 'public/comics?format=comic&formatType=comic&hasDigitalIssue=true&limit=' + limit +'&offset=' + (limit*offset) + '&apikey=' + publicKey;
		$http.get(url).success(def.resolve).error(def.reject);

		return def.promise;
	};
	var LoadMore = function($scope) {
		
		this.offset = 0;
		this.busy = false;
		this.comics = [];
		this.load = function() {
			if(this.busy) {
				return;
			}
			this.busy = true;
			findNext(this.offset).then(function(results) {
				var chars = results.data.results;
				chars.forEach(function(item) {
					this.comics.push(item);
				}.bind(this));
				this.offset++;
				this.busy = false;
			}.bind(this));
		}.bind(this);
		
	};
	return {
		find: find,
		findOne: findOne,
		LoadMore: LoadMore
	};
});