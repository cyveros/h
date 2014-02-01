// ==UserScript==
// @name        sis
// @namespace   z
// @include     http://67.220.91.20/forum/thread-*.html
// @resource	zcss http://netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css
// @version     1
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     http://netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js
// ==/UserScript==


//bootstrap
$(function(){
    // common
    $('link[rel="stylesheet"], script').remove();
    $('*[style]').removeAttr('style');

    utils.load.css('http://netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css');
    //utils.load.js('http://netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js');
    
    $('#headsearch, #ad_text, .portalbox, #header, #menu, #headfilter, #footfilter, .legend, #footercontainer').remove();
    $('.threadlist table:not(:last-child)').remove();
    $('#newspecial, #newspecialtmp').remove();
    $('table').addClass('table');
    $('.separation').remove();
    $('#wrapper').addClass('container');
    
    // list
    if (utils.url.contain('forum-230')) {
        $('.threadlist h1, .threadlist .headactions').remove();
        $('.folder, .icon, .lastpost, .category, tr .nums:not(:last-child), cite, .hot label, .new label, .lock label, .common label').remove();
        $('#foruminfo').remove();
        $('.pages:eq(1), kbd, #newspecial_menu').remove();
        $('#wrapper > ul').remove();
        $('#wrapper > div:first-child').addClass('navbar navbar-default navbar-fixed-top');
        
        $('.pages').replaceWith(utils.pagination.create('.pages > *'));
        $('.pages_btns').addClass('container');//css({'margin': '0px auto'});
        
        var content = $('.mainbox').clone();
        $('.threadlist').remove();
        
        $('#wrapper').css({'padding-top': '80px'}).append(content);
        
        $('#wrapper > div:not(.threadlist, .navbar)').remove();
        
        $('.threadlist').html($('form').html());
        
        var tbody = $('tbody');
        var tbodyContainer = $('<tbody></tbody>');
        
        $.each(tbody, function(){
            tbodyContainer.append($(this).find('tr'));
        });
        
        $('.table').html(tbodyContainer);
    } else {
        // detail
        $('#newspecial_menu').remove();
        $('form[name="modactions"] .mainbox:not(:first)').remove();
        $('#foruminfo').remove();
        $('#wrapper > ul').remove();
        $('.pages_btns').remove();
        
        $('.headactions').remove();
        $('ins').remove();
        $('.postauthor').remove();
        $('.postinfo').remove();
        $('.ad_pip').remove();
        $('fieldset').remove();
        $('.postratings').remove();
        
        $('#wrapper > div:first-child').addClass('navbar navbar-default navbar-fixed-top');
        $('#wrapper > div:not(.threadlist, .navbar)').remove();
        
        var content = $('.mainbox').clone();
        $('.viewthread').remove();
        
        $('#wrapper').css({'padding-top': '80px'}).append(content);
        
        $('.viewthread').append($('.postmessage'));
        $('table').remove();
        
        $('.navbar').html('<div class="container"></div>');
        $('.navbar .container').html($('.viewthread h1'));
        $('.viewthread h1').remove();
        
        $('h1 a').remove();
        $('h1').replaceWith('<h2>' + $('h1').html() + '</h2>');
    }    
});

var utils = {
    url: {
        contain: function(str) {
            var URL = window.location.href;
            return (URL.indexOf(str) != -1);
        }
    },
    pagination: {
        create: function(selector) {
            var pages = $(selector);
            var pagination = '<ul class="pagination">';
        
            $.each(pages, function(){
                var tag = $(this).prop('tagName');
                var self = $(this);
                if (tag == 'A') {
                    if ( ! self.hasClass('last'))
                        pagination += '<li>' + $('<div>').append(self).html(); + '</li>';
                } else if (tag == 'STRONG'){
                    pagination += '<li class="active"><a href="#">' + $(this).text() + '</a></li>';
                }
            });
            
            pagination += '</ul>';
            
            return pagination;
        }
    },
    load: {
        css: function(url) {
            $('head').append('<link rel="stylesheet" href="' + url + '" type="text/css"/>');
        },
        js: function(url) {
            $('head').append('<script type="text/javascript" src="' + url + '"></script>');
        }
    }
};
