$(document).ready(function() {
    $('.s_song_tabs').tabslet({
        mouseevent: 'click',
        attribute: 'target',
        animation: false
    });
    $('.s_song_tabs > ul, .poetry-content, .poetry-catalog').niceScroll({
        cursorcolor: "#444",
        cursorwidth: 4,
        cursorborder: 0,
        cursorborderradius: 0,
    });
    $('.s_song_tabs').on("_after", function() {
        $('.poetry-content, .poetry-catalog').getNiceScroll().resize();
    });
    $('.poetry-catalog > table > tbody > tr > td.play-song').click(function() {
        $(this).parent('tr').siblings().removeClass('playing');
        $(this).parent('tr').addClass('playing');
        $('#' + $(this).parent('tr').attr('poetry-type')).find('.poetry-title').text($(this).parent('tr').attr('poetry-title'))
        $('#' + $(this).parent('tr').attr('poetry-type')).find('.poetry-author').text($(this).parent('tr').attr('poetry-author'))
        var html = '';
        var poetry_content = $(this).parent('tr').attr('poetry-content').split('+++');
        for (i = 0; i < poetry_content.length; i++) {
            html += '<div>' + poetry_content[i] + '</div>'
        }
        $('#' + $(this).parent('tr').attr('poetry-type')).find('.poetry-content').html(html)
        $('.poetry-content').getNiceScroll().resize();
    });
});