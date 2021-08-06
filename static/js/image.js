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
    var load_cat_img_list = function(tab_id){
        $.post("/image/list", {cat_tag: tab_id.replace('#', '')}, function(image_list) {
            $(tab_id + ' > div').html('<div style="width: 25%;"></div><div style="width: 25%;"></div><div style="width: 25%;"></div><div style="width: 25%;"></div>');
            $.each(image_list, function(i, v) {
                var html = '<div class="img-box">' +
                               '<img src="' + v.link + '" cat="' + v.cat + '" size="' + v.size + '" file_size="' + v.file_size + '" type="' + v.type + '" create_time="' + v.create_time + '">' +
                           '</div>';
                $(tab_id + ' > div > div:nth-child('+(i%4+1)+')').append(html);
            });
            $('.s_song_tabs > div').getNiceScroll().resize();
            $('.img-box').click(function() {
                $('.img-box').removeClass('active');
                $(this).addClass('active');
                var img_cat = $(this).find('img').attr('cat');
                $('#img-cat').html(img_cat);
                $('#img-cat-sel').find('option:contains("'+img_cat+'")').attr("selected", true);
                $('#img-size').html($(this).find('img').attr('size'));
                $('#img-f-size').html($(this).find('img').attr('file_size'));
                $('#img-type').html($(this).find('img').attr('type'));
                $('#img-ct').html($(this).find('img').attr('create_time'));
                $('#img-del').attr('cur_src', $(this).find('img').attr('src'));
                $('#img-cat-change').attr('cur_src', $(this).find('img').attr('src'));
            });
        });
    }
    load_cat_img_list($('.s_song_tabs > ul > li.active > a').attr('target'));
    $('.s_song_tabs').on("_after", function() {
        load_cat_img_list($('.s_song_tabs > ul > li.active > a').attr('target'));
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
    $('#img-cat-change').click(function() {
        if ($(this).html() == '修改') {
            $('#img-cat').hide();
            $('#img-cat-sel').show();
            $(this).html('确定');
        } else {
            $.post("/image/list/cat/change", {link: $(this).attr('cur_src'), cat_tag: $("#img-cat-sel").val()}, function(res) {
                if (res.status == 1) {
                    location.reload();
                }
            });
//            $('#img-cat-sel').hide();
//            $('#img-cat').show();
//            $(this).html('修改');
        }
    });
    $('#img-del').click(function() {
        $.post("/image/list/del", {link: $(this).attr('cur_src')}, function(res) {
            if (res.status == 1) {
                location.reload();
            }
        });
    });
});