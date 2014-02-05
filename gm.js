// ==UserScript==
// @name        sis
// @namespace   z
// @include     http://67.220.91.20/forum/*
// @include     http://www.sis001.com/forum/*
// @version     1
// @grant       GM_getResourceText
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     http://netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js
// @resource    bootstrapcss http://netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css
// ==/UserScript==

//bootstrap
$(function(){
    // remove style and script
    utils.purge();

    var sis = new Page();

    sis.load.includeCSS('bootstrapcss');
    
    // perform common task
    sis.tinker.common();

    switch(sis.route(config.route)) {
        case 'list':
            sis.tinker.list();
            break;
        case 'detail':
            sis.tinker.detail();
            break;
    }   
});

var config = {
    route: [
        {
            pattern:/^.*forum-\d+-\d+.*$/gi,
            type: 'list'
        },
        {
            pattern:/^.*forumdisplay.*fid=\d+.*?$/gi,
            type: 'list'
        },
        {
            pattern:/^.*thread-\d+-\d+-\d+.*$/gi,
            type: 'detail'
        },
        {
            pattern:/^.*viewthread.*tid=\d+.*$/gi,
            type: 'detail'
        }
    ]
};

var utils = {
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
    purge: function() {
        $('link[rel="stylesheet"], script').remove();
        $('*[style]').removeAttr('style');
        $(document).off('load');
    }
};

function Page() {
    var self = this;

    this.inPage = false;

    this.load = {
        css: function(url) {
            $('head').append('<link rel="stylesheet" href="' + url + '" type="text/css"/>');
        },
        js: function(url) {
            $('head').append('<script type="text/javascript" src="' + url + '"></script>');
        },
        modal: function() {
            $('body').append('<div id="modalContainer" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">Modal title</h4></div><div class="modal-body"><p>One fine body&hellip;</p></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button type="button" class="btn btn-primary">Get Torrent</button></div></div></div></div>');
        },
        includeCSS: function(resource) {
            var css = GM_getResourceText(resource);
            $('body').append('<style>' + css + '</style>');
        }
    };

    this.route = function(definitions) {
        var r, route = '';

        $.each(definitions, function(){
            r = new RegExp(this.pattern);

            if (r.test(window.location.href))
                route = this.type;
        });

        return route;
    };

    this.tinker = {
        common: function(){
            $('#headsearch, #ad_text, .portalbox, #header, #menu, #headfilter, #footfilter, .legend, #footercontainer').remove();
            $('#newspecial, #newspecialtmp').remove();
            $('table').addClass('table');
            $('#wrapper').addClass('container');
        },
        list: function(){
            $('#wrapper > div:first-child').addClass('navbar navbar-default navbar-fixed-top');
            $('#wrapper > div:not(.threadlist, .navbar)').remove();
            $('#wrapper > ul').remove();
            $('.threadlist table:not(:last-child)').remove();
            $('#foruminfo').remove();
            $('h1, .headactions').remove();
            $('.pages:eq(1), #newspecial_menu').remove();
            $('.folder, .icon, .lastpost, .category, tr .nums:not(:last-child), cite, .hot label, .new label, .lock label, .common label').remove();
            
            $('.pages').replaceWith(utils.pagination.create('.pages > *'));
            $('.pages_btns').addClass('container');
            
            $('.threadlist').html($('form').html());
            var content = $('.mainbox').clone();
            $('.threadlist').remove();
            
            $('#wrapper').css({'padding-top': '80px'}).append(content);
            
            var tbody = $('tbody');
            var tbodyContainer = $('<tbody></tbody>');
            
            $.each(tbody, function(){
                var threadId = $(this).prop('id').replace('normalthread_', '');
                tbodyContainer.append($(this).find('tr').attr('data-thread-id', threadId));
            });
            
            $('.table').html(tbodyContainer);

            $('a').attr('target', '_blank');

            self.load.modal();

            $(document).on('click', '.threadlist a', function(e){
                e.preventDefault();

                self.open($(this).prop('href'));

            });
        },
        detail: function(){
            // detail
            $('#newspecial_menu').remove();
            $('form[name="modactions"] .mainbox:not(:first)').remove();
            $('#foruminfo').remove();
            $('#wrapper > ul').remove();

            if (self.inPage)
                $('.modal-body .pages_btns').remove();
            else
                $('.pages_btns').remove();
            
            $('.headactions').remove();
            $('ins').remove();
            $('.postauthor').remove();
            $('.postinfo').remove();
            $('.ad_pip').remove();
            $('fieldset').remove();
            $('.postratings').remove();

            if (self.inPage) {
                var title = $('.modal-body h1').text();
                var contents = $('.modal-body .postmessage').clone();

                $('.modal-body').html('');
                $('.modal-title').text(title);

                var ul = '<ul class="list-unstyled text-overflow">';

                $.each(contents, function(){
                    ul += '<li>' + $(this).html() + '</li>';
                });

                ul += '</ul>';

                $('.modal-body').html(ul);

                if ($('.postattachlist a:eq(1)').length > 0) {
                    var dlLink = $('.postattachlist a:eq(1)').prop('href');
                    var dlName = $('.postattachlist a:eq(1)').text();

                    $('.modal-footer .btn-primary').attr('data-dl-link', dlLink);
                    $('.modal-footer .btn-primary').attr('data-dl-name', dlName);
                }

                $('.postattachlist').remove();

                $.each($('.modal-body li:not(:first)'), function(){
                    $(this).html('<blockquote>' + $(this).text() + '</blockquote');
                });

                $('.modal-body img:not(.postattachlist img)').css({
                    'width': '800px',
                    'height': 'auto'
                });

                $('.modal-footer .btn-primary').click(function(){
                    window.open($('.modal-footer .btn-primary').attr('data-dl-link'), '_blank');
                });
            } else {
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
        }
    };

    this.open = function(url) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'HTML',
            beforeSend: function(xhr){
                xhr.overrideMimeType('text/plain; charset=gbk');
            }
        }).done(function(data){
            if (data) {
                // remove all js
                data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                // remove head
                data = data.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
                // remove html/body tag
                data = data.replace(/.*?<(!DOCTYPE|body|html).*?>/gi, '');

                data = data.replace(/onload=".*?"/gi, '');

                var html = $(data);

                $('.modal-body').html(html.find('form').html());
                self.tinker.common();
                self.inPage = true;

                self.tinker.detail();
            }

            $('.modal-dialog').css({
                'width': '844px'
            });
            $('#modalContainer').modal();
        });

    }
}
