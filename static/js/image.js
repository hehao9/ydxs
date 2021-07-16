$(document).ready(function() {
    $('.s_song_tabs').tabslet({
        mouseevent: 'click',
        attribute: 'target',
        animation: false
    });
    $.post("/image/list", {cat_tag: $('.s_song_tabs > ul > li.active > a').attr('target').replace('#', '')}, function(image_list){
        var html = "";
        $.each(image_list, function(i, v) {
            html += '<img style="margin: 10px;" height="150" src="' + v.link + '">';
        });
        $($('.s_song_tabs > ul > li.active > a').attr('target') + ' > div').html(html);
    });
});