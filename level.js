$(document).ready(function() {
    $('body').addClass('fade-in');

    $('.back-button').click(function() {
        goToPage('main.html'); 
    });

    $('.level1-button').click(function() {
       createPopup('level1.html', 'level1_story.png');
    });

    $('.level2-button').click(function() {
        createPopup('level2.html', 'level2_story.png');
    });

    $('.level3-button').click(function() {
        createPopup('level3.html', 'level3_story.png');
    });

    $('.level4-button').click(function() {
        createPopup('level4.html', 'level4_story.png');
    });

    
});

function createPopup(pageUrl, backgroundImageUrl) {
    var popupBlock = $('<div class="popup-block"></div>');
    popupBlock.css({
        position: 'absolute', 
        top: '220px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        backgroundImage: 'url(' + backgroundImageUrl + ')', 
        backgroundSize: 'cover', 
        width: '600px',
        height: '324px',
        border: 'none',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: '9999'
    });

    var closeButton = $('<button class="close-button"></button>');
    closeButton.css({
        position: 'absolute',
        top: '60px',
        right: '23px',
        width: '40px',
        height: '40px',
        border: 'none',
        backgroundColor: 'transparent',
        backgroundImage: 'url("x_button.png")', 
        backgroundSize: 'cover' 
    });

    closeButton.click(function() {
        popupBlock.remove(); // 
    });

    var button = $('<button class="level-button"></button>');
    button.css({
        position: 'relative',
        top: '230px', 
        width: '200px', 
        height: '67px', 
        border: 'none',
        left: '200px',
        transition: 'transform 0.2s ease',
        backgroundColor: 'transparent', 
        backgroundImage: 'url("entrance_button.png")', 
        backgroundSize: 'cover' 
    });
    button.hover(function() {
        $(this).css('transform', 'scale(1.1)'); 
    }, function() {
        $(this).css('transform', 'scale(1)'); 
    });
    button.click(function() {
        goToPage(pageUrl);
    });

    popupBlock.append(closeButton);
    popupBlock.append(button);

    $('body').append(popupBlock);
}

function goToPage(url) {
    $('body').addClass('fade-out'); 
    setTimeout(function() {
        window.location.href = url; 
    }, 500); 
}
