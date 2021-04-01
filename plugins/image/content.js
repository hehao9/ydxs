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
            if($('div.pin > div.actions > div.left').length > 0) {
                $('div.pin > div.actions > div.left').each(function(){
                    if($(this).find('a.image-plugin').length == 0) {
                        $(this).prepend('<a class="image-plugin repin pin-default btn btn14 rbtn" onclick="clickFun(this, 1);"><span class="text">收藏</span></a>');
                    }
                });
            }
            if($('div.tool-bar').length > 0) {
                if($('div.tool-bar > a.image-plugin').length == 0) {
                    $('div.tool-bar').prepend('<a class="image-plugin repin pin-default btn btn14 rbtn" onclick="clickFun(this, 2);"><span class="text">收藏</span></a>');
                }
            }
            addBtn();
        }, 500);
    }
    addBtn();
})();