/*
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

import config from './../config.js';

var instance = null;
var settings_all = [];

/**
 * Selection class - draws rectangular selection on canvas, can be resized.
 */
class Base_selection_class {

	/**
	 * settings:
	 * - enable_background
	 * - enable_borders
	 * - enable_controlls
	 * 
	 * @param {ctx} ctx
	 * @param {object} settings
	 * @param {string} key
	 */
	constructor(ctx, settings, key = null) {
		if (key != null) {
			settings_all[key] = settings;
		}

		//singleton
		if (instance) {
			return instance;
		}
		instance = this;

		this.ctx = ctx;
		this.mouse_lock = null;
		this.selected_obj_positions = {};
		this.selected_object_drag_type = null;

		this.events();
	}

	events() {
		var _this = this;

		document.addEventListener('mousedown', function (e) {
			_this.selected_object_actions(e);
		});
		document.addEventListener('mousemove', function (e) {
			_this.selected_object_actions(e);
		});
		document.addEventListener('mouseup', function (e) {
			_this.selected_object_actions(e);
		});
	}

	set_selection(x, y, width, height) {
		var settings = this.find_settings();

		if (x != null)
			settings.data.x = x;
		if (y != null)
			settings.data.y = y;
		if (width != null)
			settings.data.width = width;
		if (height != null)
			settings.data.height = height;
		config.need_render = true;
	}

	reset_selection() {
		var settings = this.find_settings();

		settings.data = {
			x: null,
			y: null,
			width: null,
			height: null,
		};
		config.need_render = true;
	}

	get_selection() {
		var settings = this.find_settings();

		return settings.data;
	}

	find_settings() {
		var current_key = config.TOOL.name;
		var settings = null;

		for (var i in settings_all) {
			if (i == current_key)
				settings = settings_all[i];
		}

		//default
		if (settings === null) {
			settings = settings_all['main'];
		}

		//find data
		settings.data = (settings.data_function).call();

		return settings;
	}

	/**
	 * marks object as selected, and draws corners
	 */
	draw_selection() {
		var _this = this;
		var settings = this.find_settings();
		var data = settings.data;

		if (settings.data === null || settings.data.status == 'draft') {
			return;
		}

		var x = settings.data.x;
		var y = settings.data.y;
		var w = settings.data.width;
		var h = settings.data.height;

		if (x == null || y == null || w == null || h == null) {
			//not supported 
			return;
		}

		var block_size_default = 14;
		block_size_default = Math.ceil(block_size_default / config.ZOOM);

		if (config.ZOOM != 1) {
			x = Math.round(x);
			y = Math.round(y);
			w = Math.round(w);
			h = Math.round(h);
		}
		var block_size = block_size_default;
		var half_size = Math.ceil(block_size / 2);

		this.ctx.save();
		if (data.rotate != null && data.rotate != 0) {
			//rotate
			this.ctx.translate(data.x + data.width / 2, data.y + data.height / 2);
			this.ctx.rotate(data.rotate * Math.PI / 180);
			x = Math.round(-data.width / 2);
			y = Math.round(-data.height / 2);
		}
		
		var half_fix = 0.5;

		//fill
		if (settings.enable_background == true) {
			this.ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
			this.ctx.fillRect(x, y, w, h);
		}

		//borders
		if (settings.enable_borders == true && config.layers.length > 1) {
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = "rgba(0, 128, 0, 0.5)";
			this.ctx.strokeRect(x + half_fix, y + half_fix, w, h);
		}

		//draw corners
		if (Math.abs(w) > block_size * 3 && Math.abs(h) > block_size * 3) {
			corner(x - half_size, y - half_size, 0, 0, 'left_top');
			corner(x + w + half_size, y - half_size, -1, 0, 'right_top');
			corner(x - half_size, y + h + half_size, 0, -1, 'left_bottom');
			corner(x + w + half_size, y + h + half_size, -1, -1, 'right_bottom');
		}

		if (settings.enable_controlls == true) {
			//draw centers
			if (Math.abs(w) > block_size * 5) {
				corner(x + w / 2 - block_size / 2, y - half_size, 0, 0, 'top');
				corner(x + w / 2 - block_size / 2, y + h + half_size, 0, -1, 'bottom');
			}
			if (Math.abs(h) > block_size * 5) {
				corner(x - half_size, y + h / 2 - block_size / 2, 0, 0, 'left');
				corner(x + w + half_size, y + h / 2 - block_size / 2, -1, 0, 'right');
			}
		}

		function corner(x, y, dx, dy, name) {
			var block_size = Math.round(block_size_default / 2) * 2;
			x = Math.round(x);
			y = Math.round(y);
			var angle = 0;
			if (settings.data.rotate != null && settings.data.rotate > 0) {
				angle = settings.data.rotate;
			}

			//register position
			_this.selected_obj_positions[name] = {
				x: x + dx * block_size,
				y: y + dy * block_size,
				size: block_size,
			};

			if (settings.enable_controlls == false || angle > 0) {
				_this.ctx.strokeStyle = "rgba(0, 128, 0, 0.4)";
				_this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
			}
			else {
				_this.ctx.strokeStyle = "#008000";
				_this.ctx.fillStyle = "#ffffff";
			}

			//borders
			_this.ctx.lineWidth = 1;
			if (config.ZOOM < 1)
				_this.ctx.lineWidth = 2;
			_this.ctx.beginPath();
			_this.ctx.arc(
				x + dx * block_size + half_size,
				y + dy * block_size + half_size,
				half_size, 0, 2 * Math.PI);
			_this.ctx.fill();
			_this.ctx.stroke();
		}

		//restore
		this.ctx.restore();
	}

	selected_object_actions(e) {
		var settings = this.find_settings();
		if (document.body.style.cursor != 'default') {
			document.body.style.cursor = 'default';
		}
		if (e.type == 'mousedown' && config.mouse.valid == false || settings.enable_controlls == false) {
			return;
		}
		if (settings.data != null && settings.data.rotate != null && settings.data.rotate > 0) {
			//controls on rotated object disabled
			return;
		}

		var mouse = config.mouse;
		var type = this.selected_object_drag_type;

		if (e.type == 'mousemove' && this.mouse_lock == 'selected_object_actions') {
			document.body.style.cursor = "pointer";
			if (e.buttons == 1) {
				//do transformations
				var dx = mouse.x - mouse.last_x;
				var dy = mouse.y - mouse.last_y;

				if (type == 'left_top') {
					settings.data.x += dx;
					settings.data.y += dy;
					settings.data.width -= dx;
					settings.data.height -= dy;
				}
				else if (type == 'right_top') {
					settings.data.width += dx;
					settings.data.y += dy;
					settings.data.height -= dy;
				}
				else if (type == 'left_bottom') {
					settings.data.x += dx;
					settings.data.height += dy;
					settings.data.width -= dx;
				}
				else if (type == 'right_bottom') {
					settings.data.width += dx;
					settings.data.height += dy;
				}
				else if (type == 'top') {
					settings.data.y += dy;
					settings.data.height -= dy;
				}
				else if (type == 'bottom')
					settings.data.height += dy;
				else if (type == 'left') {
					settings.data.x += dx;
					settings.data.width -= dx;
				}
				else if (type == 'right')
					settings.data.width += dx;

				config.need_render = true;
			}
			return;
		}
		if (e.type == 'mouseup' && this.mouse_lock == 'selected_object_actions') {
			//reset
			this.mouse_lock = null;
		}

		for (var i in this.selected_obj_positions) {
			var positions = this.selected_obj_positions[i];

			if (mouse.x >= positions.x && mouse.x <= positions.x + positions.size
				&& mouse.y >= positions.y && mouse.y <= positions.y + positions.size
				) {
				//match
				if (e.type == 'mousedown') {
					if (e.buttons == 1) {
						this.mouse_lock = 'selected_object_actions';
						this.selected_object_drag_type = i;
					}
				}
				if (e.type == 'mousemove') {
					document.body.style.cursor = "pointer";
				}
			}
		}
	}

}

export default Base_selection_class;
