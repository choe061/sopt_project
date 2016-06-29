ee-lru
======

LRU Memory Cache ( last recent used )




	var cache = new LRUCache( {
		  limit: 100000  	// max number of items
		, ttl: 3600000 		// 1h ( remove items not accessed in the last hour )
	} );




	cache.set( "someId", { some: "data" } );

	cache.get( "someId" ); // { some: "data" }

	cache.has( "someId" ); // true

	cache.remove( "someId" );