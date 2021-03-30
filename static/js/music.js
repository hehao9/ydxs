$(document).ready(function() {
    $.ajaxSettings.async = false;
    $('#s_song_name').focus();
    var audio = document.getElementById('audio');
    audio.volume = 0.5;
    $('#lyric_result').niceScroll({
        cursorcolor: "#444",
        cursorwidth: 4,
        cursorborder: 0,
        cursorborderradius: 0,
    });
    setTimeout(function () {
        //console.log($('#visitor_id').val());
        $.post("/music/play/list", {visitor_id: $('#visitor_id').val()}, function(play_list){
            var html = "";
            $.each(play_list, function(i, v) {
                html = '<tr style="cursor: pointer;" song-id="' + v.song_id + '"' +
                'song-name="' + v.song_name + '"' +
                'song-singer="' + v.song_singer + '"' +
                'song-duration="' + v.song_duration + '"' +
                'song-platform="' + v.song_platform + '"' +
                'song-album-id="' + v.song_album_id + '"' +
                'song-hash="' + v.song_hash + '">' +
                '<td><i class="iconfont icon-list-play" style="font-size: 12px;"></i></td>' +
                '<td>' + v.song_name + '</td>' +
                '<td>' + v.song_singer + '</td>' +
                '<td>' + v.song_duration +'</td>' +
                '<td><i class="iconfont icon-cancel"></i></td></tr>';
            });
            $('#playlist-tab > table > tbody').append(html);
            $('#playlist-count').text($('#playlist-tab > table > tbody > tr').length);
            $('#playlist-tab tr[song-id]').click(function() {
                $(this).siblings().removeClass('playing');
                $(this).addClass('playing');
                play_song($(this));
            });
            $('#playlist-tab > table > tbody > tr:first-child').click();
            $('#play-pause').attr('class', 'iconfont icon-play');
            audio.pause();
            $('#playlist-tab tr[song-id] .icon-cancel').click(function() {
                if ($(this).parents('tr').hasClass('playing')) {
                    if ($('#playlist-tab > table > tbody > tr').length > 1) {
                        var continue_to_play = 0;
                        if ($('#playlist-tab > table > tbody > tr.playing').next().attr('song-id')) {
                            continue_to_play = $('#playlist-tab > table > tbody > tr.playing').next();
                        } else {
                            continue_to_play = $('#playlist-tab > table > tbody > tr:first-child');
                        }
                        $(this).parents('tr').remove();
                        continue_to_play.siblings().removeClass('playing');
                        continue_to_play.addClass('playing');
                        play_song(continue_to_play);
                    } else {
                        $(this).parents('tr').remove();
                        $('.song-name').text('');
                        $('.song-singer').text('');
                        $('#song-duration').text('00:00');
                        if ($('#search_list').css('display') == 'block') {
                            $('.s_song_tabs > div').getNiceScroll().resize();
                        }
                        $('#playlist-tab').getNiceScroll().resize();
                        song_progress.slider('setAttribute', 'max', 0);
                        song_progress.slider('setValue', 0);
                        $('#lyric_result').html('');
                        if ($('#page-lyric').css('display') == 'block') {
                            $('#lyric_result').getNiceScroll().resize();
                        }
                        $('#audio').attr('src', '');
                        $('#play-pause').attr('class', 'iconfont icon-play');
                    }
                } else {
                    $(this).parents('tr').remove();
                    $('#playlist-tab').getNiceScroll().resize();
                    if ($('#page-lyric').css('display') == 'block') {
                        $('#lyric_result').getNiceScroll().resize();
                    }
                    if ($('#search_list').css('display') == 'block') {
                        $('.s_song_tabs > div').getNiceScroll().resize();
                    }
                }
                var count = $('#playlist-tab > table > tbody > tr').length;
                $('#playlist-count').text(count);
                if (count == 0) {
                    $('.icon-play-cicle').css('color', '');
                }
            });
        });
    }, 500);
    $('#playlist-tab').niceScroll({
        cursorcolor: "#444",
        cursorwidth: 4,
        cursorborder: 0,
        cursorborderradius: 0,
    });
    var song_progress_on_slide = false;
    var song_progress = $('#song-progress-input').slider({
        step: 0.2,
        min: 0,
        max: 0,
        value: 0,
        tooltip: 'hide'
    });
    song_progress.slider('on', 'slide', function(result) {
        if ($('#audio').attr('src') != '') {
            // 设置当前播放时间显示
            var millis = parseInt(result);
            var seconds = millis % 60;
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            var minutes = parseInt(millis / 60)
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            $('#song-currentTime').text(minutes + ':' + seconds);

            // 设置歌词进度
            var half_lrc_screen_height = parseInt($("#lyric_result").height() / 2);
            $("#lyric_result > div").each(function(i, e){
                if (result >= $(this).attr('t')) {
                    var left_scroll_lyric_height = ($("#lyric_result > div").length - i) * 30 + 15 - half_lrc_screen_height;
                    if (left_scroll_lyric_height > 0) {
                        var scroll_lyric_height = i * 30 + 15 - half_lrc_screen_height;
                        if (scroll_lyric_height > 0) {
                            if (left_scroll_lyric_height < 30) {
                                scroll_lyric_height = scroll_lyric_height - 30 + left_scroll_lyric_height;
                            }
                            if (scroll_lyric_height % 2 == 1) {
                                scroll_lyric_height = scroll_lyric_height - 1;
                            }
                            $("#lyric_result").getNiceScroll(0).doScrollTop(scroll_lyric_height);
                        }
                    }
                    $(this).css({'font-size': '15px', 'color': '#28a745'});
                    $(this).siblings().attr('style', '');
                }
            });
        }
    });
    song_progress.slider('on', 'slideStart', function(result) {
        if ($('#audio').attr('src') != '') {
            song_progress_on_slide = true;
        }
    });
    song_progress.slider('on', 'slideStop', function(result) {
        if ($('#audio').attr('src') != '') {
            audio.currentTime = result;
            if ($('#play-pause').attr('class') == 'iconfont icon-pause'){
                audio.play();
            }
            song_progress_on_slide = false;
        }
    });
    var play_song = function (data_ele) {
        $('.icon-play-cicle').each(function(){
            if ($(this).parent('td').attr('song-id') == data_ele.attr('song-id')) {
                $('.icon-play-cicle').css('color', '');
                $(this).css('color', '#28a745');
                return false;
            }
        });
        $('.song-name').text(data_ele.attr('song-name'));
        $('.song-singer').text(data_ele.attr('song-singer'));
        $('#song-duration').text(data_ele.attr('song-duration'));
        if ($('#search_list').css('display') == 'block') {
            $('.s_song_tabs > div').getNiceScroll().resize();
        }
        if ($('.playlist-box').css('display') == 'block') {
            $('#playlist-tab').getNiceScroll().resize();
        }
        $('#lyric_result').html('');
        if ($('#page-lyric').css('display') == 'block') {
            $('#lyric_result').getNiceScroll().resize();
        }
        $('#audio').attr('src', '');
        $('#play-pause').attr('class', 'iconfont icon-play');
        var params = {
            song_platform: data_ele.attr('song-platform'),
            song_id: data_ele.attr('song-id'),
            song_album_id: data_ele.attr('song-album-id'),
            song_hash: data_ele.attr('song-hash'),
        }
        $.post("/music/play/detail", params, function(song_detail){
            var html = "";
            $.each(song_detail['lyric'], function(i, v) {
                html += '<div class="text-center" t=' + v.t + '>' + v.c + '</div>';
            });
            $('#lyric_result').html(html);
            if ($('#page-lyric').css('display') == 'block') {
                $('#lyric_result').getNiceScroll().resize();
            }
            $('#audio').attr('src', song_detail['url']);
            $('#play-pause').attr('class', 'iconfont icon-pause');
            audio.play();
        });
    }
    $('#s_song_name').keyup(function(event) {
        if (event.keyCode == 13) {
            if ($(this).val()) {
                $.get('/music/search/' + $(this).val(), function(song_results) {
                    $('#s_song_results').html(song_results);
                    $('.s_song_tabs').tabslet({
                        mouseevent: 'hover',
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
                    if ($('#playlist-tab > table > tbody > tr.playing').length > 0) {
                        $('.icon-play-cicle').each(function(){
                            if ($(this).parent('td').attr('song-id') == $('#playlist-tab > table > tbody > tr.playing').attr('song-id')) {
                                $('.icon-play-cicle').css('color', '');
                                $(this).css('color', '#28a745');
                                return false;
                            }
                        });
                    }
                    $('.icon-play-cicle').click(function() {
                        var added = false;
                        var song_id = $(this).parent('td').attr('song-id');
                        $("#playlist-tab > table > tbody > tr").each(function(){
                            if ($(this).attr('song-id') == song_id) {
                                added = true;
                                $(this).click();
                                return false;
                            }
                        });
                        if (!added) {
                            var html = '<tr style="cursor: pointer;" song-id="' + song_id + '"' +
                            'song-name="' + $(this).parent('td').attr('song-name') + '"' +
                            'song-singer="' + $(this).parent('td').attr('song-singer') + '"' +
                            'song-duration="' + $(this).parent('td').attr('song-duration') + '"' +
                            'song-platform="' + $(this).parent('td').attr('song-platform') + '"' +
                            'song-album-id="' + $(this).parent('td').attr('song-album-id') + '"' +
                            'song-hash="' + $(this).parent('td').attr('song-hash') + '">' +
                            '<td><i class="iconfont icon-list-play" style="font-size: 12px;"></i></td>' +
                            '<td>' + $(this).parent('td').attr('song-name') + '</td>' +
                            '<td>' + $(this).parent('td').attr('song-singer') + '</td>' +
                            '<td>' + $(this).parent('td').attr('song-duration') +'</td>' +
                            '<td><i class="iconfont icon-cancel"></i></td></tr>';
                            var playing_tr = $('#playlist-tab > table > tbody > tr.playing');
                            if (playing_tr.length > 0) {
                                playing_tr.after(html);
                            } else {
                                $('#playlist-tab > table > tbody').append(html);
                            }
                            $('#playlist-count').text($('#playlist-tab > table > tbody > tr').length);
                            $('.s_song_tabs > div').getNiceScroll().resize();
                            if ($('.playlist-box').css('display') == 'block') {
                                $('#playlist-tab').getNiceScroll().resize();
                            }
                            $('#playlist-tab tr[song-id=' + song_id + ']').click(function() {
                                $(this).siblings().removeClass('playing');
                                $(this).addClass('playing');
                                play_song($(this));
                            });
                            $('#playlist-tab tr[song-id=' + song_id + ']').click();
                            $('#playlist-tab tr[song-id=' + song_id + '] .icon-cancel').click(function() {
                                if ($(this).parents('tr').hasClass('playing')) {
                                    if ($('#playlist-tab > table > tbody > tr').length > 1) {
                                        var continue_to_play = 0;
                                        if ($('#playlist-tab > table > tbody > tr.playing').next().attr('song-id')) {
                                            continue_to_play = $('#playlist-tab > table > tbody > tr.playing').next();
                                        } else {
                                            continue_to_play = $('#playlist-tab > table > tbody > tr:first-child');
                                        }
                                        $(this).parents('tr').remove();
                                        continue_to_play.siblings().removeClass('playing');
                                        continue_to_play.addClass('playing');
                                        play_song(continue_to_play);
                                    } else {
                                        $(this).parents('tr').remove();
                                        $('.song-name').text('');
                                        $('.song-singer').text('');
                                        $('#song-duration').text('00:00');
                                        if ($('#search_list').css('display') == 'block') {
                                            $('.s_song_tabs > div').getNiceScroll().resize();
                                        }
                                        $('#playlist-tab').getNiceScroll().resize();
                                        song_progress.slider('setAttribute', 'max', 0);
                                        song_progress.slider('setValue', 0);
                                        $('#lyric_result').html('');
                                        if ($('#page-lyric').css('display') == 'block') {
                                            $('#lyric_result').getNiceScroll().resize();
                                        }
                                        $('#audio').attr('src', '');
                                        $('#play-pause').attr('class', 'iconfont icon-play');
                                    }
                                } else {
                                    $(this).parents('tr').remove();
                                    $('#playlist-tab').getNiceScroll().resize();
                                    if ($('#page-lyric').css('display') == 'block') {
                                        $('#lyric_result').getNiceScroll().resize();
                                    }
                                    if ($('#search_list').css('display') == 'block') {
                                        $('.s_song_tabs > div').getNiceScroll().resize();
                                    }
                                }
                                var count = $('#playlist-tab > table > tbody > tr').length;
                                $('#playlist-count').text(count);
                                if (count == 0) {
                                    $('.icon-play-cicle').css('color', '');
                                }
                            });
                        }
                    });
                    $('.icon-add').click(function() {
                        var added = false;
                        var song_id = $(this).parent('td').attr('song-id');
                        $("#playlist-tab > table > tbody > tr").each(function(){
                            if ($(this).attr('song-id') == song_id) {
                                added = true;
                                return false;
                            }
                        });
                        if (!added) {
                            var html = '<tr style="cursor: pointer;" song-id="' + song_id + '"' +
                            'song-name="' + $(this).parent('td').attr('song-name') + '"' +
                            'song-singer="' + $(this).parent('td').attr('song-singer') + '"' +
                            'song-duration="' + $(this).parent('td').attr('song-duration') + '"' +
                            'song-platform="' + $(this).parent('td').attr('song-platform') + '"' +
                            'song-album-id="' + $(this).parent('td').attr('song-album-id') + '"' +
                            'song-hash="' + $(this).parent('td').attr('song-hash') + '">' +
                            '<td><i class="iconfont icon-list-play" style="font-size: 12px;"></i></td>' +
                            '<td>' + $(this).parent('td').attr('song-name') + '</td>' +
                            '<td>' + $(this).parent('td').attr('song-singer') + '</td>' +
                            '<td>' + $(this).parent('td').attr('song-duration') +'</td>' +
                            '<td><i class="iconfont icon-cancel"></i></td></tr>';
                            $('#playlist-tab > table > tbody').append(html);
                            $('#playlist-count').text($('#playlist-tab > table > tbody > tr').length);
                            $('.s_song_tabs > div').getNiceScroll().resize();
                            if ($('.playlist-box').css('display') == 'block') {
                                $('#playlist-tab').getNiceScroll().resize();
                            }
                            $('#playlist-tab tr[song-id=' + song_id + ']').click(function() {
                                $(this).siblings().removeClass('playing');
                                $(this).addClass('playing');
                                play_song($(this));
                            });
                            if ($('#playlist-tab > table > tbody > tr').length == 1) {
                                $('#playlist-tab tr[song-id=' + song_id + ']').click();
                            }
                            $('#playlist-tab tr[song-id=' + song_id + '] .icon-cancel').click(function() {
                                if ($(this).parents('tr').hasClass('playing')) {
                                    if ($('#playlist-tab > table > tbody > tr').length > 1) {
                                        var continue_to_play = 0;
                                        if ($('#playlist-tab > table > tbody > tr.playing').next().attr('song-id')) {
                                            continue_to_play = $('#playlist-tab > table > tbody > tr.playing').next();
                                        } else {
                                            continue_to_play = $('#playlist-tab > table > tbody > tr:first-child');
                                        }
                                        $(this).parents('tr').remove();
                                        continue_to_play.siblings().removeClass('playing');
                                        continue_to_play.addClass('playing');
                                        play_song(continue_to_play);
                                    } else {
                                        $(this).parents('tr').remove();
                                        $('.song-name').text('');
                                        $('.song-singer').text('');
                                        $('#song-duration').text('00:00');
                                        if ($('#search_list').css('display') == 'block') {
                                            $('.s_song_tabs > div').getNiceScroll().resize();
                                        }
                                        $('#playlist-tab').getNiceScroll().resize();
                                        song_progress.slider('setAttribute', 'max', 0);
                                        song_progress.slider('setValue', 0);
                                        $('#lyric_result').html('');
                                        if ($('#page-lyric').css('display') == 'block') {
                                            $('#lyric_result').getNiceScroll().resize();
                                        }
                                        $('#audio').attr('src', '');
                                        $('#play-pause').attr('class', 'iconfont icon-play');
                                    }
                                } else {
                                    $(this).parents('tr').remove();
                                    $('#playlist-tab').getNiceScroll().resize();
                                    if ($('#page-lyric').css('display') == 'block') {
                                        $('#lyric_result').getNiceScroll().resize();
                                    }
                                    if ($('#search_list').css('display') == 'block') {
                                        $('.s_song_tabs > div').getNiceScroll().resize();
                                    }
                                }
                                var count = $('#playlist-tab > table > tbody > tr').length;
                                $('#playlist-count').text(count);
                                if (count == 0) {
                                    $('.icon-play-cicle').css('color', '');
                                }
                            });
                        }
                    });
                });
            }
        }
    });
    $('#play-pause').click(function() {
        if ($('#audio').attr('src') != '') {
            if (audio.paused) {
                $(this).attr('class', 'iconfont icon-pause');
                audio.play();
            } else {
                $(this).attr('class', 'iconfont icon-play');
                audio.pause();
            }
        }
    });
    var volume_progress = $('#volume-progress-input').slider({
        step: 1,
        min: 0,
        max: 100,
        value: 50,
        tooltip: 'show',
        orientation: 'vertical',
        reversed: true,
        tooltip: 'hide'
    });
    volume_progress.slider('on', 'slide', function(result) {
        $('#vol-val').text(result);
        audio.volume = result / 100;
        if (audio.volume == 0) {
            $('#volume').attr('class', 'iconfont icon-volume-0');
        } else {
            $('#volume').attr('class', 'iconfont icon-volume-1');
        }
    });
    volume_progress.slider('on', 'slideStop', function(result) {
        $('#vol-val').text(result);
        audio.volume = result / 100;
        if (audio.volume == 0) {
            $('#volume').attr('class', 'iconfont icon-volume-0');
        } else {
            $('#volume').attr('class', 'iconfont icon-volume-1');
        }
    });
    $(document).click(function(){ $(".volume-box").hide(); });
    $('.volume-box').click(function(e){ e.stopPropagation(); });
    $('#volume').click(function(e) {
        e.stopPropagation();
        $('.volume-box').toggle();
    });
    $('#playlist').click(function(e) {
        $('.playlist-box').toggle('fast', function() {
            if ($('.playlist-box').css('display') == 'block') {
                $('#playlist').css('color', '#28a745');
                $('#playlist-tab').getNiceScroll().resize();
            } else {
                $('#playlist').css('color', '');
            }
            if ($('#page-lyric').css('display') == 'block') {
                $('#lyric_result').getNiceScroll().resize();
            }
            if ($('#search_list').css('display') == 'block') {
                $('.s_song_tabs > div').getNiceScroll().resize();
            }
        });
    });
    $('#lyric').click(function() {
        if ($('#page-lyric').css('display') == 'none') {
            $('#cur_title_line').hide();
        }
        $('#search_list').slideToggle('fast');
        $('#page-lyric').slideToggle('fast', function() {
            if ($('#page-lyric').css('display') == 'block') {
                $('#lyric_result').getNiceScroll().resize();
                $('#lyric').attr('class', 'iconfont icon-lyric1');
                $('#lyric').css('color', '#28a745');
            } else {
                $('#lyric').css('color', '');
                $('#lyric').attr('class', 'iconfont icon-lyric');
                $('#cur_title_line').show();
                $('.s_song_tabs > div').getNiceScroll().resize();
            }
            if ($('.playlist-box').css('display') == 'block') {
                $('#playlist-tab').getNiceScroll().resize();
            }
        });
    });
    audio.ontimeupdate = function() {
        if (!song_progress_on_slide) {
            if (audio.ended) {
                $('#play-pause').attr('class', 'iconfont icon-play');
                audio.currentTime = 0;
                setTimeout(function() {
                    if ($('#play-rule').attr('class') == 'iconfont icon-list-loop') {
                        if ($('#playlist-tab > table > tbody > tr').length > 1) {
                            var continue_to_play = 0;
                            if ($('#playlist-tab > table > tbody > tr.playing').next().attr('song-id')) {
                                continue_to_play = $('#playlist-tab > table > tbody > tr.playing').next();
                            } else {
                                continue_to_play = $('#playlist-tab > table > tbody > tr:first-child');
                            }
                            continue_to_play.siblings().removeClass('playing');
                            continue_to_play.addClass('playing');
                            play_song(continue_to_play);
                        } else {
                            $('#play-pause').attr('class', 'iconfont icon-pause');
                            audio.play();
                        }
                    } else {
                        $('#play-pause').attr('class', 'iconfont icon-pause');
                        audio.play();
                    }
                }, 1000);
            }
            // 设置跟随播放进度条
            song_progress.slider('setAttribute', 'max', parseInt(audio.duration));
            song_progress.slider('setValue', audio.currentTime);

            // 设置当前播放时间显示
            var millis = parseInt(audio.currentTime);
            var seconds = millis % 60;
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            var minutes = parseInt(millis / 60)
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            $('#song-currentTime').text(minutes + ':' + seconds);

            // 设置歌词进度
            var half_lrc_screen_height = parseInt($("#lyric_result").height() / 2);
            $("#lyric_result > div").each(function(i, e){
                if (audio.currentTime >= $(this).attr('t')) {
                    var left_scroll_lyric_height = ($("#lyric_result > div").length - i) * 30 + 15 - half_lrc_screen_height;
                    if (left_scroll_lyric_height > 0) {
                        var scroll_lyric_height = i * 30 + 15 - half_lrc_screen_height;
                        if (scroll_lyric_height > 0) {
                            if (left_scroll_lyric_height < 30) {
                                scroll_lyric_height = scroll_lyric_height - 30 + left_scroll_lyric_height;
                            }
                            if (scroll_lyric_height % 2 == 1) {
                                scroll_lyric_height = scroll_lyric_height - 1;
                            }
                            $("#lyric_result").getNiceScroll(0).doScrollTop(scroll_lyric_height);
                        } else {
                            $("#lyric_result").getNiceScroll(0).doScrollTop(0);
                        }
                    }
                    $(this).css({'font-size': '15px', 'color': '#28a745'});
                    $(this).siblings().attr('style', '');
                }
            });
        }
    }
    $('#play-rule').click(function() {
        if ($(this).attr('class') == 'iconfont icon-single-loop') {
            $(this).attr('class', 'iconfont icon-list-loop')
        } else {
            $(this).attr('class', 'iconfont icon-single-loop')
        }
    });
    $('.icon-next').click(function() {
        if ($('#playlist-tab > table > tbody > tr').length > 1) {
            var continue_to_play = 0;
            if ($('#playlist-tab > table > tbody > tr.playing').next().attr('song-id')) {
                continue_to_play = $('#playlist-tab > table > tbody > tr.playing').next();
            } else {
                continue_to_play = $('#playlist-tab > table > tbody > tr:first-child');
            }
            continue_to_play.siblings().removeClass('playing');
            continue_to_play.addClass('playing');
            play_song(continue_to_play);
        }
    });
    $('.icon-prev').click(function() {
        if ($('#playlist-tab > table > tbody > tr').length > 1) {
            var continue_to_play = 0;
            if ($('#playlist-tab > table > tbody > tr.playing').prev().attr('song-id')) {
                continue_to_play = $('#playlist-tab > table > tbody > tr.playing').prev();
            } else {
                continue_to_play = $('#playlist-tab > table > tbody > tr:last-child');
            }
            continue_to_play.siblings().removeClass('playing');
            continue_to_play.addClass('playing');
            play_song(continue_to_play);
        }
    });
    $('.icon-del').click(function() {
        $('#playlist-tab > table > tbody').empty();
        $('#playlist-count').text(0);
        $('.icon-play-cicle').css('color', '');
        $('.song-name').text('');
        $('.song-singer').text('');
        $('#song-duration').text('00:00');
        if ($('#search_list').css('display') == 'block') {
            $('.s_song_tabs > div').getNiceScroll().resize();
        }
        $('#playlist-tab').getNiceScroll().resize();
        song_progress.slider('setAttribute', 'max', 0);
        song_progress.slider('setValue', 0);
        $('#lyric_result').html('');
        if ($('#page-lyric').css('display') == 'block') {
            $('#lyric_result').getNiceScroll().resize();
        }
        $('#audio').attr('src', '');
        $('#play-pause').attr('class', 'iconfont icon-play');
    });
});