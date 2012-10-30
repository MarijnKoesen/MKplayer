(function(MK) {
	MK.Settings = (function() {
		var settings = null;

		var ensureLoad = (function() {
			settings = MK.cookie.getAll();
			return function() {} // make sure we only execute once
		})();

		return {
			cookieLifetime: 365, // in days

			set: function(name, value) {
				ensureLoad();
				settings[name] = value;
				this.save();
			},

			get: function(name) {
				ensureLoad();
				return settings[name] !== null ? settings[name] : null;
			},

			delete: function(name) {
				ensureLoad();
				if (settings[name]) {
					delete settings[name];
					MK.cookie.delete(name);
				}
			},

			save: function() {
				ensureLoad();

				var cookieParts = [], i = 0, setting;

				for (setting in settings) {
					MK.cookie.set(setting, settings[setting], this.cookieLifetime);
				}
			}
		}
	})();
})(MK);
