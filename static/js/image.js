$(document).ready(function() {
    $('.s_song_tabs').tabslet({
        mouseevent: 'click',
        attribute: 'target',
        animation: false
    });
    $.post("/image/list", {visitor_id: ''}, function(image_list){
        var html = "";
        $.each(image_list, function(i, v) {
            html += '<img src="' + v.link + '">';
        });
        $($('.s_song_tabs > ul > li.active > a').attr('target')).html(html);
    });
});