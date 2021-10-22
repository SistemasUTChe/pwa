var url = window.location.href;
var swLocation = '/pwa/sw.js';

console.log(url);
if ( navigator.serviceWorker ) {
    if ( url.includes('localhost') ) {
        swLocation= '/sw.js';
    };

    navigator.serviceWorker.register('swLocation');
}

