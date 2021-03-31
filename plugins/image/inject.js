function clickFun(obj) {
    alert($(obj).parents('div.pin.wfc').find('a.img img').attr('src'));
}