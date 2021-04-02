(function () {
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.src = chrome.extension.getURL('inject.js');
    script.onload = function () {
        this.parentNode.removeChild(this);
    }
    document.body.appendChild(script);

    function addBtn() {
        setTimeout(function(){
            let elements = document.querySelectorAll('div.pin > div.actions > div.left');
            if(elements.length > 0) {
                [].forEach.call(elements, function(element) {
                    if(element.querySelectorAll('a.image-plugin').length == 0) {
                        let btn = document.createElement('a');
                        btn.setAttribute('class', 'image-plugin repin pin-default btn btn14 rbtn');
                        btn.setAttribute('onclick', 'clickFun(this, 1);');
                        btn.innerHTML = '<span class="text">收藏</span>';
                        element.appendChild(btn);
                    }
                });
            }
            if(document.querySelectorAll('div.tool-bar').length > 0) {
                if(document.querySelectorAll('div.tool-bar > a.image-plugin').length == 0) {
                    let btn = document.createElement('a');
                    btn.setAttribute('class', 'image-plugin repin pin-default btn btn14 rbtn');
                    btn.setAttribute('onclick', 'clickFun(this, 2);');
                    btn.innerHTML = '<span class="text">收藏</span>';
                    document.querySelector('div.tool-bar').appendChild(btn);
                }
            }
            addBtn();
        }, 500);
    }
    addBtn();
})();