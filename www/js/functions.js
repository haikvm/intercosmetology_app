function appPreloader(show) {
	if (show) $('body').append('<div class="app_preloader"></div>');
		else $('.app_preloader').remove();
}
function contentLoader(show, str) {
	if (str == undefined) str = 'Загрузка...';
	if (!$('.content_loader').is('div')) {
		$('body').append('<div class="content_loader"><span></span></div>')
	}
	$('.content_loader span').html(str);
	if (show) {
		$('.content_loader').addClass('show');
	} else {
		$('.content_loader').removeClass('show');
	}
}
function preloadAssets(success) {
	appPreloader(true);
	db.getSettings('FIRST_RUN', function(firstRun) {
		db.getAssetDates(function(res) {
			if (firstRun.data == 'Y') {
				assets = false;
			} else {
				assets = {CACHE: res};
			}
			initPreloadedData(assets)
		});	
	})
}
function initPreloadedData(assets) {
	connect.get('preload_resources', assets, function(res) {
		if (res != false) {
			$.each(res.js, function(code, value) {
				db.saveAssets(value.DATE, 'js', code, value.CONTENT);
			});
			$.each(res.css, function(code, value) {
				db.saveAssets(value.DATE, 'css', code, value.CONTENT);
			});
			$.each(res.templates, function(code, value) {
				db.saveTemplate(value.DATE, code, value.CONTENT);
			});
			$.each(res.remove, function(key, value) {
				db.removeFiles(value);
			});
			db.saveSettings('FIRST_RUN', 'N');
		}
		window.templates = new Object();
		db.getTemplates(function() {
			db.getAssets(function(assets) {
				$.each(assets, function() {
					console.log(this.type);
					if (this.type == 'js') {
						$('head').append('<script type="text/javascript">' + this.data + '</script>');
					} else if (this.type == 'css') {
						$('body').append('<style>' + this.data + '</style>');
					}
				});
				appPreloader(false);
			});
		});
	})
}
function content(options, success) {
	// options: template, data, container
	$.tmpl(window.templates[options.template], options.data).appendTo(options.container);
	if (success) success()
}
function makeHash(obj) {
	var hashStr = '';
	$.each(obj, function(n,v) {hashStr += n+':'+v+'|'});
	return(hex_md5(hashStr));
}