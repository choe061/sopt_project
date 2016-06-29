


	var MySQLPool = require( "./" );


	var pool = new MySQLPool( {
		database:					"eventbox"
		, hosts: [ {
			  host: 				"10.80.100.1"
			, port: 				3306
			, user: 				"root"
			, password: 			""
			, weight: 				1
			, writable: 			true
			, maxConnections: 		10
		} ]
	} );


	pool.query( "SHOW TABLES in eventbox;", function( err, result ){
		console.log( err, result );
	} );