(function () {
    let path = 'inject.js';
    let script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    // 注意，路径需用Chrome API 生成，这个方法可以获得插件的资源的真实路径。
    // 类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    script.src = chrome.extension.getURL(path);
    script.onload = function () {
        // 在执行完代码之后移除script标签
        this.parentNode.removeChild(this);
    }
    document.body.appendChild(script);

    let script1 = document.createElement('script');
    script1.setAttribute('type', 'text/javascript');
    script1.src = 'https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js';
    script1.onload = function () {
        // 在执行完代码之后移除script标签
        this.parentNode.removeChild(this);
    }
    document.body.appendChild(script1);

    function addBtn() {
        setTimeout(function(){
            if($('div.pin.wfc > div.actions > div.left').length > 0) {
                $('div.pin.wfc > div.actions > div.left').each(function(){
                    if($(this).find('a.image-plugin').length == 0) {
                        $(this).prepend('<a class="image-plugin repin pin-default btn btn14 rbtn" onclick="clickFun(this)"><span class="text">收藏</span></a>');
                    }
                });
            }
            if($('div.tool-bar').length > 0) {
                if($('div.tool-bar > a.image-plugin').length == 0) {
                    $('div.tool-bar').prepend('<a class="image-plugin repin pin-default btn btn14 rbtn" href="#"><span class="text">收藏</span></a>');
                    $('div.tool-bar > a.image-plugin').click(function() {
                        alert($('#baidu_image_holder img').attr('src'));
                    });
                }
            }
            addBtn();
        }, 500);
    }
    addBtn();
})();