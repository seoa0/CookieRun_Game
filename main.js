$(document).ready(function() {

    $('body').addClass('fade-in');

    function goToPage(url) {
        $('body').addClass('fade-out'); 
        setTimeout(function() {
        window.location.href = url; 
        }, 500); 
    }

    $('.start-button').click(function() {
        goToPage('level.html');
    });

    $('.rules-button').click(function() {
        goToPage('rule.html');
    });
});