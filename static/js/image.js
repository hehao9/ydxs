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
    $('.icon-add').click(function() {
        var html = '<li>' +
                        '<a class="d-flex" target="#uuid" style="padding: 0px 10px;">' +
                            '<div class="align-self-center" style="margin-right: 5px;"><i class="iconfont icon-files"></i></div>' +
                            '<div class="align-self-center">' +
                                '<input id="s_song_name" type="text" class="border-0" style="width: 100%; background-color: inherit;" autocomplete="off">' +
                            '</div>' +
                            '<div class="align-self-center ml-auto"><i class="iconfont icon-confirm"></i></div>' +
                        '</a>'
                    '</li>'
        $('.s_song_tabs > ul').append(html);
        $('#s_song_name').focus()
    });
});