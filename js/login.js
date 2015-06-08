var app = angular.module('loginApp', []);

app.constant('AUTH_EVENTS', {
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	sessionTimeout: 'auth-session-timeout',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})
app.constant('USER_ROLES', {
	all: '*',
	admin: 'admin',
	editor: 'editor',
	guest: 'guest'
})

app.controller('LoginController', function ($scope, $rootScope, $location, $timeout, AUTH_EVENTS, USER_ROLES, AuthService) {
	$scope.credentials = {
		email: '',
		password: ''
	};
	$scope.loginMsg='';
	$scope.loginClass='';

	$scope.login = function (isValid) {
		if (isValid == undefined || isValid == false) return;
		AuthService.login($scope.credentials).then(function (user) {
			$rootScope.$broadcast('login-result', {msg: AUTH_EVENTS.loginSuccess, class: 'success'});
			$scope.setCurrentUser(user);
			$timeout($scope.redirectUrl, 2000);
		}, function () {
			$rootScope.$broadcast('login-result', {msg: AUTH_EVENTS.loginFailed, class: 'danger'});
		});
	};

	$scope.currentUser = null;
	$scope.userRoles = USER_ROLES;
	$scope.isAuthorized = AuthService.isAuthorized;

	$scope.setCurrentUser = function (user) {
		$scope.currentUser = user;
	};
	$scope.$on('login-result', function(event, arg){
		$scope.loginMsg = arg.msg;
		$scope.loginClass = arg.class;
	});
	$scope.redirectUrl = function(){
		window.location = 'http://www.google.com/';
	};
})

app.service('Session', function () {
	this.create = function (sessionId, userId, userRole) {
		this.id = sessionId;
		this.userId = userId;
		this.userRole = userRole;
	};
	this.destroy = function () {
		this.id = null;
		this.userId = null;
		this.userRole = null;
	};
})

app.factory('AuthService', function ($http, Session) {
	var authService = {};

	authService.login = function (credentials) {
		return $http
			.post('login.php', credentials)
			.then(function (res) {
				if(res.data.status === "error") return $q.reject(res);
				if(res.data.status === "ok") Session.create(res.data.id, res.data.user.id, res.data.user.role);
				return res.data.user;
			});	
	};

	authService.isAuthenticated = function () {
		return !!Session.userId;
	};

	authService.isAuthorized = function (authorizedRoles) {
		if (!angular.isArray(authorizedRoles)) {
			authorizedRoles = [authorizedRoles];
		}
		return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
	};

	return authService;
})