function initFingerprintJS() {
    FingerprintJS.load().then(fp => {
        fp.get().then(result => {
            let input = document.createElement('input');
            input.setAttribute('id', 'visitor_id');
            input.setAttribute('type', 'hidden');
            input.setAttribute('value', result.visitorId);
            document.body.appendChild(input);
        });
    });
}

function clickFun(obj , type) {
    var src = '';
    if(type == 1) {
        src = obj.parentNode.parentNode.parentNode.querySelector('a.layer-view img').getAttribute('src');
    }
    if(type == 2) {
        src = document.querySelector('#baidu_image_holder img').getAttribute('src');
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "http://127.0.0.1:5000/image/list/add", true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send('visitor_id='+document.querySelector('#visitor_id').value+'&link='+src);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            console.log(xmlhttp.responseText);
        }
    }
}