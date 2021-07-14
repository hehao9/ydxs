chrome.contextMenus.create({
    id: 'keep_pic',
	type : 'normal',
	title : "收藏图片-PicKeepOL",
	contexts: ['image']
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch(info.menuItemId){
        case 'keep_pic':
            let formData = new FormData();
            formData.append('link', info.srcUrl);
            fetch('http://localhost:5000/image/list/add', {method:"POST", body:formData})
            .then(res => res.json())
            .then(res => {
                alert(res.status)
            })
            break;
    }
});
chrome.browserAction.onClicked.addListener(function(activeTab) {
    chrome.tabs.create({ url: "http://localhost:5000/image" });
});