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
            var pagination = '<ul class="pagination pagination-sm container">';
        
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
    },
    nano: function(template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
            var keys = key.split("."), v = data[keys.shift()];
            for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
            return (typeof v !== "undefined" && v !== null) ? v : "";
        });
    }
};

function Page() {
    var self = this;

    this.settings = {
        data: (new DataProvider()),
        inPage: false
    };

    this.db = self.settings.data;

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
        navbar: function() {
            $('body').prepend('<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a class="navbar-brand" href="#">第一会所</a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">板块 <b class="caret"></b></a><ul class="dropdown-menu"><li><a href="forumdisplay.php?fid=519">原创培训</a></li><li><a href="forumdisplay.php?fid=143">亚无原创</a></li><li><a href="forumdisplay.php?fid=25">亚无转贴</a></li><li><a href="forumdisplay.php?fid=230">亚有原创</a></li><li><a href="forumdisplay.php?fid=58">亚有转贴</a></li><li><a href="forumdisplay.php?fid=229">欧无原创</a></li><li><a href="forumdisplay.php?fid=77">欧无转贴</a></li><li><a href="forumdisplay.php?fid=231">动漫原创</a></li><li><a href="forumdisplay.php?fid=27">动漫转贴</a></li><li><a href="forumdisplay.php?fid=406">新手原创</a></li><li><a href="forumdisplay.php?fid=394">分流宣传</a></li><li><a href="forumdisplay.php?fid=530">自拍原创</a></li></ul></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">分类 <b class="caret"></b></a><ul id="categories" class="dropdown-menu"></ul></li><li id="headerPaginator"></li></ul><ul class="nav navbar-nav navbar-right"><li id="navPag"><a href="#"></a></li><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a><ul class="dropdown-menu"><li><a href="#">Action</a></li><li><a href="#">Another action</a></li><li><a href="#">Something else here</a></li><li class="divider"></li><li><a href="#">Separated link</a></li></ul></li></ul></div></div></nav>');
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
        },
        list: function(){
            self.load.navbar();
            $('#wrapper > div:not(.threadlist, :first-child)').remove();
            $('#wrapper > ul').remove();
            $('.threadlist table:not(:last-child)').remove();
            $('#foruminfo').remove();
            $('h1, .headactions').remove();
            $('.pages:eq(1), #newspecial_menu').remove();
            $('.folder, .icon, .lastpost, .category, tr .nums:not(:last-child), cite, .hot label, .new label, .lock label, .common label').remove();
            
            $('#wrapper').prepend(utils.pagination.create('.pages > *'));
            //$('#headerPaginator').html(utils.pagination.create('.pages > *'));
            $('#wrapper div:first-child').remove();

            $('.pages_btns').addClass('container');
            
            $('.threadlist').html($('form').html());
            var content = $('.mainbox').clone();
            $('.threadlist').remove();
            
            $('#wrapper').css({'padding-top': '80px'}).append(content);
            
            var tbody = $('tbody');
            var tbodyContainer = '<tbody>';

            var threadId, category, article;
            
            $.each(tbody, function(){
                if ($(this).html() != '') {
                    threadId = $(this).prop('id').replace('normalthread_', '');
                    category = $(this).find('th > em a'),

                    article = {
                        id: threadId,
                        title: $(this).find('th > span:eq(0) a').text(),
                        categoryId: category.prop('href').match(/typeid=([^&]+)/)[1],
                        categoryName: category.text(),
                        date: $(this).find('td').text()
                    };

                    self.db.collection('articles', article);
                    self.db.collection('categories', {id: article.categoryId, name: article.categoryName});

                    tbodyContainer += utils.nano('<tr><td><a href="forumdisplay.php?fid=230&filter=type&typeid={categoryId}" class="badge">{categoryName}</a><a href="thread-{id}-1-1.html">{title}</a></td><td><span class="label label-success">{date}</span></td></tr>', article);    
                }
            });

            tbodyContainer += '</tbody>';
            
            $('.table').html(tbodyContainer);

            self.tinker.category();

            self.load.modal();

            $(document).on('click', '.threadlist a:not(.badge)', function(e){
                e.preventDefault();

                self.open($(this).prop('href'));
            });
        },
        detail: function(){
            // detail
            $('#newspecial_menu').remove();
            $('form[name="modactions"] .mainbox:not(:first)').remove();
            $('#foruminfo').remove();
            $('.modal-body  #wrapper > ul').remove();

            if (self.settings.inPage)
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

            if (self.settings.inPage) {
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
        },
        category: function() {
            var categories = self.db.find('categories'),
                output = '';

            $.each(categories, function() {
                output += utils.nano('<li><a href="forumdisplay.php?fid=230&filter=type&typeid={id}">{name}</a></li>', this);
            });

            $('#categories').html(output);
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
                self.settings.inPage = true;

                self.tinker.detail();
            }

            $('.modal-dialog').css({
                'width': '844px'
            });
            $('#modalContainer').modal();
        });

    }
}

function DataProvider() {
    var self = this;

    this.settings = {
        data: {

        },
        registry: {
        	collection: {},
        	collectionCount: 0
        }
    };

    this.push = function(key, value) {
        var tmp = {};
        tmp[key] = value;
        self.settings.data = $.extend(self.settings.data, tmp);
    };

    this.collection = function(name, value) {
    	if (self.hasCollection(name)) {
            if ( ! self.hasCollectionEntry(name, value)) {
                self.settings.data[name].push(value);
                self.settings.registry.collection[name].entry += 1;
                // for fast index search
                self.settings.registry.collection[name].ids.push(value.id);
            }
        } else {
            self.addCollection(name);
            self.collection(name, value);
        }
    };

    this.hasCollection = function(name) {
    	return self.settings.registry.collection.hasOwnProperty(name);
    };

    this.hasCollectionEntry = function(name, value) {
    	return (self.settings.registry.collection[name].ids.indexOf(value.id) >= 0);
    };

    this.addCollection = function(name) {
    	self.settings.registry.collection[name] = {
    		entry: 0,
    		schema: [],
    		ids: [] 
    	};

    	self.settings.registry.collectionCount += 1;
    	self.settings.data[name] = [];
    };

    this.void = function(key) {
        delete self.settings.data[key];
    };

    this.remove = function(collection, value){
        var index = self.settings.data[collection].indexOf(value);
        
        if (index != -1) {
            self.settings.data.splice(index, 1);
        }
    }

    this.find = function(key) {
        if (self.settings.data.hasOwnProperty(key))
            return self.settings.data[key];

        return false;
    };

    this.exist = function(key) {
        if (self.settings.data.hasOwnProperty(key))
            return true;

        return false;
    };

    this.search = function(collection, key, value) {
        var obj = null;

        if (self.exist(collection)) {
            $.each(self.settings.data[collection], function(){
                if (this[key] == value) {
                    obj = this;
                    return true;
                }
            });
        }

        if (obj !== null) {
            return obj;
        }

        return false;
    };

    this.all = function(){
        console.log(self.settings.data);
        console.log(self.settings.registry);
    };
}
