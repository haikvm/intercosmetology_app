$.Class('CDB', {
	init: function() {
		var date = new Date();
		var time = Math.round(date.getTime()/1000);
		if (device.platform == 'Android') {
			this.db = window.openDatabase('APP', '', 'Application Database', 10485760); 
		} else {
			this.db = window.sqlitePlugin.openDatabase({name: 'inco.db', iosDatabaseLocation: 'default'});
		}
		this.db.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS settings (date TEXT, code TEXT, data TEXT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS assets (date TEXT, type TEXT, code TEXT, data TEXT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS templates (date TEXT, code TEXT, data TEXT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS data (date TEXT, code TEXT, data TEXT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS sections (ID REAL, NAME TEXT, IMAGE TEXT, CODE TEXT, SORTER REAL)');
			tx.executeSql('SELECT * FROM settings WHERE code=?', ['FIRST_RUN'], function(txx, res) {
				if (res.rows.length == 0) tx.executeSql("INSERT INTO settings (date, code, data) VALUES (?,?,?)", [time, 'FIRST_RUN', 'Y']);
			});
		}, function(tx, err) {
			console.log(tx); 
			console.log(err); 
		});
		this.version = '1.2.1';
		
	},
	clear: function() {
		this.db.transaction(function(tx) {tx.executeSql('DROP TABLE settings');});
		this.db.transaction(function(tx) {tx.executeSql('DROP TABLE assets');});
		this.db.transaction(function(tx) {tx.executeSql('DROP TABLE templates');});
		this.db.transaction(function(tx) {tx.executeSql('DROP TABLE data');});
	},
	getSettings: function(name, success) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM settings WHERE code=?', [name], function(tx, res) {
				if (res.rows.length > 0) {
					var data = {
						data: res.rows.item(0).data,
						date: res.rows.item(0).date
					}
					if (success) success(data, name);
				} else {
					if (success) success(false);
				}
			});
		}, function(tx, err) {
			console.error(err);
		});
	},
	saveSettings: function(name, data) {	
		date = new Date();
		time = Math.round(date.getTime()/1000);
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM settings WHERE code=?', [name], function(txx, res) {
				if (res.rows.length > 0) tx.executeSql("UPDATE settings SET date=?, data=? WHERE code=?", [time, data, name]);
					else tx.executeSql("INSERT INTO settings (date, code, data) VALUES (?,?,?)", [time, name, data]);
			});
		}, function(tx, err) {
			console.error(err);
		});
	},
	getData: function(name, success) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM data WHERE code=?', [name], function(tx, res) {
				if (res.rows.length > 0 && res.rows.item(0).data != '') {	
					var data = {
						data: $.parseJSON(res.rows.item(0).data),
						date: res.rows.item(0).date
					}
					if (success) success(data);
				} else {
					if (success) success(false);
				}
			});
		}, function(tx, err) {
			console.error(err);
		});
	},
	saveData: function(name, data) {
		date = new Date();
		time = Math.round(date.getTime()/1000);
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM data WHERE code=?', [name], function(txx, res) {
				if (res.rows.length > 0) tx.executeSql("UPDATE data SET date=?, data=? WHERE code=?", [time, JSON.stringify(data), name]);
					else tx.executeSql("INSERT INTO data (date, code, data) VALUES (?,?,?)", [time, name, JSON.stringify(data)]);
			});
		}, function(tx, err) {
			console.error(err);
		});
	},
	saveAssets: function(date, type, code, data, success) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM assets WHERE code=?', [code], function(txx, res) {
				if (res.rows.length > 0) {
					tx.executeSql("UPDATE assets SET date=?, data=? WHERE code=?", [date, data, code], function() {
						if (success) success();
					});
				} else {
					tx.executeSql("INSERT INTO assets (date, type, code, data) VALUES (?,?,?,?)", [date, type, code, data], function() {
						if (success) success();
					});
				}
			});
		}, function(tx, err) {
			console.error(tx);
		});
	},
	getAssetDates: function(success) {
		cdb = this;
		cdb.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM assets', [], function(txx, res) {
				dates = new Object();
				for (n=0; n<res.rows.length; n++) {
					dates[res.rows.item(n).code] = res.rows.item(n).date;
				}
				cdb.db.transaction(function(tx) {
					tx.executeSql('SELECT * FROM templates', [], function(txx, res) {
						for (n=0; n<res.rows.length; n++) {
							dates[res.rows.item(n).code] = res.rows.item(n).date;
						}
						if (success) success(dates);
					});
				});
			});
		});
	},
	getAssets: function(success) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM assets', [], function(txx, res) {
				var obj = new Array(); for (n=0; n<res.rows.length; n++) {
					obj.push(res.rows.item(n))
				}
				if (success) success(obj);
			});
		});
	},
	saveTemplate: function(date, code, data) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM templates WHERE code=?', [code], function(txx, res) {
				if (res.rows.length > 0) {
					tx.executeSql("UPDATE templates SET date=?, data=? WHERE code=?", [date, data, code]);
				} else {
					tx.executeSql("INSERT INTO templates (date, code, data) VALUES (?,?,?)", [date, code, data]);
				}
			});
		}, function(tx, err) {
			console.error(tx);
		});
	},
	getTemplates: function(success) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM templates', [], function(txx, res) {
				for (n=0; n<res.rows.length; n++) {
					code = res.rows.item(n).code;
					window.templates[code.replace('.html', '')] = res.rows.item(n).data;
				}
				if (success) success();
			});
		}, function(tx, err) {
			console.error(tx);
		});
	},
	removeFiles: function(code) {
		this.db.transaction(function(tx) {
			tx.executeSql('DELETE FROM templates WHERE code=?', [code], function(txx, res) {});
			tx.executeSql('DELETE FROM assets WHERE code=?', [code], function(txx, res) {});
		});
	}
});