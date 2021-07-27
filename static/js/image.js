$(document).ready(function() {
    $('.s_song_tabs').tabslet({
        mouseevent: 'click',
        attribute: 'target',
        animation: false
    });
    $('.s_song_tabs > div').niceScroll({
        cursorcolor: "#444",
        cursorwidth: 4,
        cursorborder: 0,
        cursorborderradius: 0,
    });
    $('.s_song_tabs').on("_after", function() {
        $('.s_song_tabs > div').getNiceScroll().resize();
    });
    $.post("/image/list", {cat_tag: $('.s_song_tabs > ul > li.active > a').attr('target').replace('#', '')}, function(image_list){
        $.each(image_list, function(i, v) {
            var html = '<div class="img-box"><img src="' + v.link + '"></div>';
            var tab_id = $('.s_song_tabs > ul > li.active > a').attr('target');
            $(tab_id + ' > div > div:nth-child('+(i%4+1)+')').append(html);
        });
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
                    '</li>';
        $('.s_song_tabs > ul').append(html);
        $('#s_song_name').focus();
        $('.icon-confirm').click(function() {
            if($('#s_song_name').val() == '') {
                $('#s_song_name').focus();
            } else {
                $.post("/image/cat_tag/add", {id: '1', name: $('#s_song_name').val()}, function(res){
                    location.reload();
                });
            }
        });
    });
});