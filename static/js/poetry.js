$(document).ready(function() {
    $('.s_song_tabs').tabslet({
        mouseevent: 'hover',
        animation: false
    });
    $('.poetry_content, .s_song_tabs > ul').niceScroll({
        cursorcolor: "#444",
        cursorwidth: 4,
        cursorborder: 0,
        cursorborderradius: 0,
    });
    $('.s_song_tabs').on("_after", function() {
        $('.poetry_content, .s_song_tabs > ul').getNiceScroll().resize();
    });
});