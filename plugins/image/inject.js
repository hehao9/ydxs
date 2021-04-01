function clickFun(obj , type) {
    if(type == 1) {
        alert(obj.parentNode.parentNode.parentNode.querySelector('a.layer-view img').getAttribute('src'));
    }
    if(type == 2) {
        alert(document.querySelector('#baidu_image_holder img').getAttribute('src'));
    }
}