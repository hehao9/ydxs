var server_ip = '139.155.48.172';
function create_menu(){
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: 'refresh',
        type : 'normal',
        title : '更新目录',
        contexts: ['all']
    });
    chrome.contextMenus.create({
        id: 's',
        type : 'separator',
        contexts: ['image']
    });
    fetch('http://localhost:5000/image/list/cat_tag', {method:"POST"})
    .then(res => res.json())
    .then(res => {
        res.forEach(li => {
            chrome.contextMenus.create({
                id: li.id,
                type : 'normal',
                title : li.name,
                contexts: ['image']
            });
        });
    });
}
create_menu();
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch(info.menuItemId){
        case 'refresh':
            create_menu();
            break;
        default:
            let formData = new FormData();
            formData.append('link', info.srcUrl);
            formData.append('cat_tag', info.menuItemId);
            fetch('http://'+server_ip+':5000/image/list/add', {method:"POST", body:formData})
            .then(res => res.json())
            .then(res => {
                if(res.status != 1) {
                    alert(res.msg);
                }
            });
            break;
    }
});
chrome.extension.onMessage.addListener(function (request, sender, callback){
    server_ip = request.server_ip;
});