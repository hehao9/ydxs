var image_del = function(src_link) {
    $.post("/image/list/del", {link: src_link}, function(res) {
        if (res.status == 1) {
            $('img[src="'+src_link+'"]').parent('.img-box').remove();
        }
    });
}
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
    $.post("/image/list", {cat_tag: $('.s_song_tabs > ul > li.active > a').attr('target').replace('#', '')}, function(image_list) {
        var tab_id = $('.s_song_tabs > ul > li.active > a').attr('target');
        $.each(image_list, function(i, v) {
            var html = '<div class="img-box">' +
                           '<img src="' + v.link + '" cat="' + v.cat + '" size="' + v.size + '" file_size="' + v.file_size + '" type="' + v.type + '" create_time="' + v.create_time + '">' +
                       '</div>';
            $(tab_id + ' > div > div:nth-child('+(i%4+1)+')').append(html);
        });
        $('.img-box').click(function() {
            $('.img-box').removeClass('active');
            $(this).addClass('active');
            $('#img-cat').html($(this).find('img').attr('cat'));
            $('#img-size').html($(this).find('img').attr('size'));
            $('#img-f-size').html($(this).find('img').attr('file_size'));
            $('#img-type').html($(this).find('img').attr('type'));
            $('#img-ct').html($(this).find('img').attr('create_time'));
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
                $.post("/image/cat_tag/add", {id: '1', name: $('#s_song_name').val()}, function(res) {
                    location.reload();
                });
            }
        });
    });
    $('.icon-sub').click(function() {
        cat_tag_image_count = $('.s_song_tabs > ul > li.active > a > div.ml-auto').text();
        if (cat_tag_image_count > 0) {
            $('.s_song_tabs > ul > div.alert-danger-custom').fadeIn('fast');
            setTimeout(function () {
                $('.s_song_tabs > ul > div.alert-danger-custom').fadeOut('slow');
            }, 2000);
        } else {
            $.post("/image/cat_tag/del", {id: $('.s_song_tabs > ul > li.active > a').attr('target').replace('#', '')}, function(res) {
                location.reload();
            });
        }
    });
});