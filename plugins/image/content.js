(function () {
    let inject = document.createElement('script');
    inject.setAttribute('type', 'text/javascript');
    inject.src = chrome.extension.getURL('inject.js');
    inject.onload = function () {
        this.parentNode.removeChild(this);
    }
    document.body.appendChild(inject);

    let fingerprint = document.createElement('script');
    fingerprint.setAttribute('type', 'text/javascript');
    fingerprint.src = chrome.extension.getURL('fp.min.js');
    fingerprint.setAttribute('onload', 'initFingerprintJS();');
    fingerprint.onload = function () {
        this.parentNode.removeChild(this);
    }
    document.body.appendChild(fingerprint);

    function addBtn() {
        setTimeout(function(){
            let elements = document.querySelectorAll('div.pin > div.actions > div.right');
            if(elements.length > 0) {
                [].forEach.call(elements, function(element) {
                    if(element.querySelectorAll('a.image-plugin').length == 0) {
                        let btn = document.createElement('a');
                        btn.setAttribute('class', 'image-plugin');
                        btn.setAttribute('onclick', 'clickFun(this, 1);');
                        btn.innerHTML = '<span class="text">收</span>';
                        element.appendChild(btn);
                    }
                });
            }
            if(document.querySelectorAll('div.tool-bar').length > 0) {
                if(document.querySelectorAll('div.tool-bar > a.image-plugin').length == 0) {
                    let btn = document.createElement('a');
                    btn.setAttribute('class', 'image-plugin');
                    btn.setAttribute('onclick', 'clickFun(this, 2);');
                    btn.innerHTML = '<span class="text">收</span>';
                    document.querySelector('div.tool-bar').appendChild(btn);
                }
            }
            addBtn();
        }, 500);
    }
    addBtn();
})();