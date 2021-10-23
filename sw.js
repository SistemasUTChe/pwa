
const CACHE_STATIC_NAME  = 'pwa-static-v1';
const CACHE_DYNAMIC_NAME = 'pwa-dynamic-v1';
const CACHE_INMUTABLE_NAME = 'pwa-inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 50;

var APP_SHELL = [
    'index.html',
    'css/style.css',
    'img/main.jpg',
    'js/app.js',
    'img/no-img.jpg',
    'pages/offline.html' 
  ];


function limpiarCache( cacheName, numeroItems ) {


    caches.open( cacheName )
        .then( cache => {

            return cache.keys()
                .then( keys => {
                    
                    if ( keys.length > numeroItems ) {
                        cache.delete( keys[0] )
                            .then( limpiarCache(cacheName, numeroItems) );
                    }
                });

            
        });
}




self.addEventListener('install', e => {


    const cacheProm = caches.open( CACHE_STATIC_NAME )
        .then( cache => {

            return cache.addAll(APP_SHELL);

        
        });

    const cacheInmutable = caches.open( CACHE_INMUTABLE_NAME )
            .then( cache => cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'));


    e.waitUntil( Promise.all([cacheProm, cacheInmutable]) );

});


self.addEventListener('activate', e => {


    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== CACHE_STATIC_NAME && key.includes('static') ) {
                return caches.delete(key);
            }

        });

    });



    e.waitUntil( respuesta );

});





self.addEventListener('fetch', e => {


    // 2- Cache with Network Fallback
    const respuesta = caches.match( e.request )
        .then( res => {

            if ( res ) return res;

            // No existe el archivo

            return fetch( e.request ).then( newResp => {

                caches.open( CACHE_DYNAMIC_NAME )
                    .then( cache => {
                        cache.put( e.request, newResp );
                        limpiarCache( CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT );
                    });

                return newResp.clone();
            })
            .catch( err => {

                if ( e.request.headers.get('accept').includes('text/html') ) {
                    return caches.match('pages/offline.html');
                }

                if ( /\.(png|jpg)$/i.test( e.request.url ) ) {

                    return caches.match('img/no-img.jpg');
                }    

            
            });


        });




    e.respondWith( respuesta );



});