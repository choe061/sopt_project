


	var LRUCache = require('./');




	var cache = new LRUCache({
        //ttl: 100
        //, forceTtl: true
    });


	cache.set('a', 11, 100);
	cache.set('b', 22);
	cache.set('a', 33);

	console.log(cache.get('a'));
	console.log(cache.length);

    setTimeout(function() {
        console.log(cache.get('a'));
    }, 12000);