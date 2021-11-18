$.Class('CCONNECT', {
	init: function() {
		this.url = 'https://www.intercosmetology.ru/app/api.php';
		this.version = '0.0.1';
		this.appOnline = true;
	},
	post: function(request, options, success) {
		if (!options) options = new Object();
		options.request = request;
		options.device = device.model;
		options.deviceuuid = device.uuid;
		cl = this;
		cl.onConnect(function(connected) {
			if (connected) {
				$.post(cl.url, options, function(data) {
					success(data);
				}, 'json').fail(function() {
					success(false);
				});
			} else {
				success(false);
			}
		});
	},
	get: function(request, options, success) {
		$.support.cors = true;
		var cl = this;
		if (!options) options = new Object();
		options.request = request;
		options.device = device.model;
		options.deviceuuid = device.uuid;
		options.platform = device.platform;
		var date = new Date();
		var time = Math.round(date.getTime()/1000);
		cl.onConnect(function(connected) {
			contentLoader(true);
			var hash = makeHash(options);
			db.getSettings('region_id', function(region) {
				options.region = region.data;
				db.getSettings('lat', function(lat) {
					options.lat = lat.data;
					db.getSettings('lon', function(lon) {
						options.lon = lon.data;
						db.getSettings('userlogin', function(userlogin) {
							options.userlogin = userlogin.data;
							db.getSettings('userhash', function(userhash) {
								options.userhash = userhash.data;
								db.getData(hash, function(res) {
									options.date = res.date;
									if (connected) {
										try {
											$.ajax({
												beforeSend: function() {
													$('.ajax_progress_bar').show().css('width', 0);
												},
												xhr: function() {
													var xhr = new window.XMLHttpRequest();
													xhr.addEventListener("progress", function(evt){
														if (evt.lengthComputable) {
															var percentComplete = (evt.loaded / evt.total).toFixed(2)*100;
															$('.ajax_progress_bar').css('width', percentComplete+'%').html();
														}
													}, false);
													return xhr;
												},
												type: 'GET',
												url: 'https://www.intercosmetology.ru/app/api.php',
												data: options,
												success: function(data) {
													$('.ajax_progress_bar').hide();
													contentLoader(false);
													if (data) {
														success(data);
														if (request != 'preload_resources' && request != 'get_items') {
															db.saveData(hash, data);
														}
													} else {
														success(res.data);
													}
												},
												dataType: 'json',
												error: function() {
													$('.ajax_progress_bar').hide();
													console.log('error');
													if (noDevice) {
														if (confirm('Ошибка подключения к серверу. Повторить?')) {
															location.reload();
														}
													} else {
														navigator.notification.confirm(
															'Ошибка подключения к серверу',
															function(index) {
																if (index == 1) {
																	$.get(cl.url, options, function(data) {
																		contentLoader(false);
																		if (data) {
																			success(data);
																			if (request != 'preload_resources') {
																				db.saveData(hash, data);
																			}
																		} else {
																			success(res.data);
																		}
																	}, 'json').fail(function(t1, t2, t3) {
																		location.reload();
																	});
																} else {
																	location.reload();
																}
															},
															'Подключение',
															['Повторить', 'Отменить']
														);
													}
												}
											});
											
										} catch(e) {
											location.reload();
										}
									} else {
										contentLoader(false);
										if (res) {
											success(res.data);
										} else {
											success(false);
										}
									};
								});
							});
						});
					});
				});
			});
		});
	},
	onConnect: function(callback) {
		var cl = this;
		if (cl.appOnline == true) {
			var networkState = navigator.connection.type;
			if (networkState == Connection.NONE) {
				navigator.notification.confirm(
					'Нет связи',
					onPrompt,
					'Связь',
					['Еще раз','Работать автономно']
				);
				function onPrompt(result) {
					if (result == 1) {
						cl.onConnect(callback);
					} else {
						cl.appOnline = false;
						callback(false);
					}
				}

			} else {
				callback(true);
			}
		} else {
			callback(false);
		}
	}
});