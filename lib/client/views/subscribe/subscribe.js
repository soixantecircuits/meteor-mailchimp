var subscribeTitle,
	subscribeEmail,
	subscribeButton,
	subscribeMessage			= 'A mail and this gonna rocks !',
	subscribeBeginMail			= 'This adress looks nice !',
	subscribeMiddleMail			= 'Wow ! Better.',
	subscribeValidMail			= 'Go on ! Subscribe !',
	subscribeInvalidEmail		= 'Keep going ! Your email is invalid.',
	subscribeSubscribing		= 'Subscribing...',
	subscribeSuccess			= 'Check your inbox!',
	subscribeAlreadySubscribed	= 'Already subscribed! O.o',

	showMessage = function ( message ) {
		if ( subscribeTitle ) {
			subscribeTitle.innerHTML = message;
		}
	},

	isValidEmailAddress = function ( emailAddress ) {
		// http://stackoverflow.com/a/46181/11236
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test( emailAddress );
	},

	validateEmailAddress = function ( updateMessage ) {
		if ( subscribeEmail.value !== '' && isValidEmailAddress( subscribeEmail.value ) ) {
			subscribeButton.disabled = false;
			if ( updateMessage ) {
				showMessage( subscribeValidMail );
			}
		} else {
			subscribeButton.disabled = true;
			if ( subscribeEmail.value !== '' ) {
				var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@/;
				if(re.test(subscribeEmail.value)){
					showMessage( subscribeMiddleMail );
				} else {
					showMessage( subscribeBeginMail );
				}
			} else if ( updateMessage ) {
				showMessage( subscribeMessage );
			}
		}
	},

	mailChimpListSubscribe = function ( email, list_id ) {
		var mailChimp = new MailChimp(/* apiKey, options */);

		mailChimp.call( 'lists', 'subscribe',
			{
				id: list_id,		// null -> defined @ server
				email: {
					email: email
				}
			},

			function ( error, result ) {
				if ( error ) {
					switch ( error.error ) {
						case 232:	// 'Email_NotExists'
							showMessage( subscribeInvalidEmail );
							break;
						case 214:	// 'List_AlreadySubscribed'
							showMessage( subscribeAlreadySubscribed );
							break;
						case 200:	// 'List_DoesNotExist'
							// We shouldn't be here!
						default:
							showMessage( 'Internal error [' + error.error + ']' );
					}
					console.log( '[MailChimp][Subscribe] Error: ' + error.error + ' - ' + error.reason );
				} else {
					console.log( '[MailChimp][Subscribe]: ' + subscribeEmail.value + ' ' + subscribeSuccess );
					console.log( JSON.stringify( result ) );
					showMessage( subscribeSuccess );
				}

				subscribeEmail.disabled = false;
				validateEmailAddress( false );
			}
		);
	},

	subscribeGo = function ( eventBubbling ) {
		subscribeEmail.disabled		= true;
		subscribeButton.disabled	= true;
		showMessage( subscribeSubscribing );
		mailChimpListSubscribe( subscribeEmail.value );
		// Prevent Event Bubbling
		return eventBubbling;
	};

Template.MailChimpListSubscribe.rendered = function () {
	subscribeTitle	= this.find( '.message' );
	subscribeEmail	= this.find( '.email' );
	subscribeButton	= this.find( '.subscribe' );
	subscribeButton.disabled = ( subscribeEmail.value === '' );
};

Template.MailChimpListSubscribe.helpers({
	message: function() {
		return subscribeMessage;
	}
});

Template.MailChimpListSubscribe.events({
	'focus .email, paste .email, cut .email': function ( e ) {
		setTimeout(function( e ) {
			validateEmailAddress( true );
		}, 0);
	},
	
	'blur .email': function(){
		if(!isValidEmailAddress(subscribeEmail.value)){
			showMessage( subscribeInvalidEmail );
		}
	},

	'keyup .email': function ( e ) {
		var key = e.which || e.keyCode || e.charCode;
		if ( key === 8 ||				// [Backspace]
			 key === 46	) {				// [Delete]
			setTimeout(function() {
				validateEmailAddress( true );
			}, 0);
		}
	},

	'keypress .email': function ( e ) {
		var key = e.which || e.keyCode || e.charCode;
		setTimeout(function() {
			validateEmailAddress( true );
			if ( isValidEmailAddress( subscribeEmail.value  ) ) {
				if ( key === 13	) {		// [Return]
					subscribeGo( true );
				}
			}
		}, 0);
	},

	'click .subscribe': function ( e ) {
		validateEmailAddress( true );
		if ( isValidEmailAddress( subscribeEmail.value  ) ) {
			subscribeGo( false );
		}
	}
});
