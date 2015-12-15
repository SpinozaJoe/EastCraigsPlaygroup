// app.js

(function ()
{
    var app = angular.module('nurseryApp', ['ngRoute']);

    app.controller('AppController', function ()
    {
        var now = new Date(Date.now());

        this.currentYear = now.getFullYear();
    });

    // configure our routes
    app.config(function ($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl: 'pages/home.html',
                controller: 'mainController'
            })

            // route for the about page
            .when('/about', {
                templateUrl: 'pages/about.html',
                controller: 'aboutController'
            })

            // route for the blog page
            .when('/blog', {
                templateUrl: 'pages/blog.html',
                controller: 'blogController',
                controllerAs: 'blogCtrl'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl: 'pages/contact.html',
                controller: 'contactController',
                controllerAs: 'contact'
            });
    });

    // create the controller and inject Angular's $scope
    app.controller('mainController', function ($scope, $timeout) {
        var handle_nav = function (e) {
            e.preventDefault();
            var nav = $(this);
            nav.parents('.carousel').carousel(nav.data('slide'));
        }

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                // Sort out the heights
//                carouselNormalization();

                // Start the carousel after view loaded.
                $('.carousel').carousel({
                    interval: 5000 //changes the speed
                }).on('click', '.carousel-control', handle_nav);
            }, 1000);
        });

        function carouselNormalization() {
            var items = $('.carousel-inner .item'), //grab all slides
                heights = [], //create empty array to store height values
                tallest; //create variable to make note of the tallest slide

            if (items.length) {
                function normalizeHeights() {
                    items.each(function () { //add heights to array
                        heights.push($(this).height());
                    });
                    tallest = Math.min.apply(null, heights); //cache largest value
                    items.each(function () {
                        $(this).css('max-height', tallest + 'px');
                    });
                };
                normalizeHeights();

                $(window).on('resize orientationchange', function () {
                    tallest = 0, heights.length = 0; //reset vars
                    items.each(function () {
                        $(this).removeClass('max-height'); //reset min-height
                    });
                    normalizeHeights(); //run it again 
                });
            }
        }
    });

    app.controller('aboutController', function ($scope) {
    });

    app.controller('blogController', function ($scope, $http) {
        var blogData = [];

        this.blogData = blogData;
        this.startIndex = 0;
        this.numBlogsPerPage = 2;

        this.blogIsVisible = function (blogIndex) {
            return (blogIndex < this.startIndex + this.numBlogsPerPage &&
                    blogIndex >= this.startIndex);
        };

        this.selectNextPage = function () {
            this.startIndex += this.numBlogsPerPage;
        };

        this.selectPreviousPage = function () {
            if (this.startIndex <= this.numBlogsPerPage) {
                this.startIndex = 0;
            } else {
                this.startIndex -= this.numBlogsPerPage;
            }
        };

        this.moreBlogsAvailable = function () {
            return (this.startIndex + this.numBlogsPerPage < this.blogData.length);
        };

        $http.get('blogdata/blogdata.json')
           .then(function (res) {
               $scope.blogCtrl.blogData = res.data;
           });
    });

    app.controller('contactController', function ()
    {
        var contact = {
            childName: '',
            childBirthDate: null,
            parentName: '',
            address: '',
            email: '',
            homePhone: '',
            mobilePhone: '',
            comments: ''
        };
        
        this.contact = contact;

        this.submit = function ()
        {
            alert('Eventually this will do something for ' + this.childName);
        }
    });

    app.directive('pageHeader', function () {
        return {
            // E stands for Element (A is for Attribute)
            restrict: 'E',
            templateUrl: 'templates/page-header.html'
        };
    });

    app.directive('pageFooter', function () {
        return {
            // E stands for Element (A is for Attribute)
            restrict: 'E',
            templateUrl: 'templates/page-footer.html'
        };
    });

})();
