function open_home_page() {
    if (chrome.extension.getBackgroundPage().server_ip == '139.155.48.172') {
        window.open("http://139.155.48.172:5000/image");
    } else {
        window.open("http://localhost:5000/image");
    }
}
document.getElementById('home-page').onclick = open_home_page;

if (chrome.extension.getBackgroundPage().server_ip == '139.155.48.172') {
    document.getElementById('switch-btn').className = 'switch-block off';
} else {
    document.getElementById('switch-btn').className = 'switch-block on';
}

function switch_fuc() {
    if (event.currentTarget.className == 'switch-block off') {
        event.currentTarget.className = 'switch-block on';
        chrome.runtime.sendMessage({server_ip: 'localhost'});
    } else {
        event.currentTarget.className = 'switch-block off';
        chrome.runtime.sendMessage({server_ip: '139.155.48.172'});
    }
}
document.getElementById('switch-btn').onclick = switch_fuc;