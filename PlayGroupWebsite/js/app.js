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

            // route for the team page
            .when('/team', {
                templateUrl: 'pages/team.html',
                controller: 'teamController'
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
            })

            // route for the lottery page
            .when('/lottery', {
                templateUrl: 'pages/lottery.html',
                controller: 'lotteryController',
                controllerAs: 'lottery'
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
                    interval: 10000 //changes the speed
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

    app.controller('teamController', function ($scope) {
    });

    app.controller('blogController', function ($scope, $http) {
        var blogData = [];

        this.blogData = blogData;
        this.startIndex = 0;
        this.numBlogsPerPage = 5;

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

    app.controller('contactController', function ($scope, $http)
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
        var hasSubmitted = false;
        
        this.contact = contact;
        this.hasSubmitted = hasSubmitted;
        this.scope = $scope;

        function getContactText(prefix, contactText) {
            var result = prefix;

            if (contactText == undefined) {
                result += "Not supplied\n";
            } else {
                result += contactText + "\n";
            }

            return result;
        }

        function emailSuccess() {
            $(document).ajaxStop(function () {
                $.unblockUI();
            });

            $.blockUI({
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                },
                message: 'Email sent successfully'
            });

            setTimeout($.unblockUI, 2000);
        }

        function emailFailure(errorMessage) {
            $(document).ajaxStop(function () {
                $.unblockUI();
            });

            $('#alertBoxMsg').text("Email failed to send with error message: " + errorMessage);
            $.blockUI({ message: $('#alertBox'), css: { width: '275px' } });
        }

        this.hideAlertBox = function () {
            $.unblockUI();
        }

        this.showContactForm = function () {
            $(document.body).animate({
                'scrollTop': $('#contactFormBox').offset().top
            }, 1000);
        }

        this.contactDetailsSupplied = function () {
            return $('#email').val() != '' ||
                   $('#phone').val() != '' ||
                   $('#mobile').val() != '';
        }

        this.submit = function ()
        {
            var bodyText = "A new child placement request has been submitted through the East Craigs Playgroup website with the following details:\n\n";
            var date = new Date(this.childBirthDate);

            this.hasSubmitted = true;

            if (!this.scope.contactForm.$valid || !this.contactDetailsSupplied())
            {
                $('#alertBoxMsg').text("Please enter correct details into any fields highlighted in red.");
                $.blockUI({ message: $('#alertBox'), css: { width: '275px' } });
                return;
            }

            bodyText += getContactText("Child's name: ", this.childName);
            bodyText += getContactText("Child's birth date: ", date.toLocaleString());
            bodyText += getContactText("Parent's Name: ", this.parentName);
            bodyText += getContactText("Address: ", this.address);
            bodyText += getContactText("Email address: ", this.email);
            bodyText += getContactText("Home phone: ", this.homePhone);
            bodyText += getContactText("Mobile phone: ", this.mobilePhone);
            bodyText += getContactText("Comments: ", this.comments);

            $http.post("http://daveltest.azurewebsites.net/api/email",
//            $http.post("http://localhost/WebService/WebsiteService/api/email",
                {
                    "customerId": "1",
                    "applicationName": "EmailApp",
                    "subject": "Child placement request for " + this.childName,
                    "body": bodyText
                }).success(function (data, status, headers, config) {
                    emailSuccess();
                }).error(function (data, status, headers, config) {
                    emailFailure(data);
                });

            // Block the page out until the email has been successful or failed
            $.blockUI({
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                },
                message: 'Please wait. Sending email...'
            });
        }
    });

    app.controller('lotteryController', function ($scope) {
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
