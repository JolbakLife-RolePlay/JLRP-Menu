(function(){
	let MenuDefaultTpl =
		'<div id="menu_{{_namespace}}_{{_name}}" class="menu_default{{#align}} align-{{align}}{{/align}}">' +
			'<div class="head_default"><span>{{{title}}}</span></div>' +
				'<div class="menu_default-items">' +
					'{{#elements}}' +
						'<div class="menu_default-item {{#selected}}selected{{/selected}}">' +
							'{{{label}}}{{#isSlider}} : &lt;{{{sliderLabel}}}&gt;{{/isSlider}}' +
						'</div>' +
					'{{/elements}}' +
				'</div>'+
			'</div>' +
		'</div>'
	;

	window.JLRP_Menu_Default = {};
	JLRP_Menu_Default.ResourceName = 'JLRP-Menus';
	JLRP_Menu_Default.opened = {};
	JLRP_Menu_Default.focus = [];
	JLRP_Menu_Default.pos = {};

	JLRP_Menu_Default.open = function(namespace, name, data) {
		if (typeof JLRP_Menu_Default.opened[namespace] == 'undefined') {
			JLRP_Menu_Default.opened[namespace] = {};
		}

		if (typeof JLRP_Menu_Default.opened[namespace][name] != 'undefined') {
			JLRP_Menu_Default.close(namespace, name);
		}

		if (typeof JLRP_Menu_Default.pos[namespace] == 'undefined') {
			JLRP_Menu_Default.pos[namespace] = {};
		}

		for (let i = 0; i < data.elements.length; i++) {
			if (typeof data.elements[i].type == 'undefined') {
				data.elements[i].type = 'default';
			}
		}

		data._index = JLRP_Menu_Default.focus.length;
		data._namespace = namespace;
		data._name = name;

		for (let i = 0; i < data.elements.length; i++) {
			data.elements[i]._namespace = namespace;
			data.elements[i]._name = name;
		}

		JLRP_Menu_Default.opened[namespace][name] = data;
		JLRP_Menu_Default.pos[namespace][name] = 0;

		for (let i = 0; i < data.elements.length; i++) {
			if (data.elements[i].selected) {
				JLRP_Menu_Default.pos[namespace][name] = i;
			} else {
				data.elements[i].selected = false;
			}
		}

		JLRP_Menu_Default.focus.push({
			namespace: namespace,
			name: name
		});

		JLRP_Menu_Default.render();
		$('#menu_' + namespace + '_' + name).find('.menu_default-item.selected')[0].scrollIntoView();
	};

	JLRP_Menu_Default.close = function(namespace, name) {
		delete JLRP_Menu_Default.opened[namespace][name];

		for (let i = 0; i < JLRP_Menu_Default.focus.length; i++) {
			if (JLRP_Menu_Default.focus[i].namespace == namespace && JLRP_Menu_Default.focus[i].name == name) {
				JLRP_Menu_Default.focus.splice(i, 1);
				break;
			}
		}

		JLRP_Menu_Default.render();
	};

	JLRP_Menu_Default.render = function() {
		let menuContainer = document.getElementById('default_menus');
		let focused = JLRP_Menu_Default.getFocused();
		menuContainer.innerHTML = '';
		$(menuContainer).hide();

		for (let namespace in JLRP_Menu_Default.opened) {
			for (let name in JLRP_Menu_Default.opened[namespace]) {
				let menuData = JLRP_Menu_Default.opened[namespace][name];
				let view = JSON.parse(JSON.stringify(menuData));

				for (let i = 0; i < menuData.elements.length; i++) {
					let element = view.elements[i];

					switch (element.type) {
						case 'default': break;

						case 'slider': {
							element.isSlider = true;
							element.sliderLabel = (typeof element.options == 'undefined') ? element.value : element.options[element.value];

							break;
						}

						default: break;
					}

					if (i == JLRP_Menu_Default.pos[namespace][name]) {
						element.selected = true;
					}
				}

				let menu = $(Mustache.render(MenuDefaultTpl, view))[0];
				$(menu).hide();
				menuContainer.appendChild(menu);
			}
		}

		if (typeof focused != 'undefined') {
			$('#menu_' + focused.namespace + '_' + focused.name).show();
		}

		$(menuContainer).show();

	};

	JLRP_Menu_Default.submit = function(namespace, name, data) {
		$.post('https://' + JLRP_Menu_Default.ResourceName + '/menu_default_submit', JSON.stringify({
			_namespace: namespace,
			_name: name,
			current: data,
			elements: JLRP_Menu_Default.opened[namespace][name].elements
		}));
	};

	JLRP_Menu_Default.cancel = function(namespace, name) {
		$.post('https://' + JLRP_Menu_Default.ResourceName + '/menu_default_cancel', JSON.stringify({
			_namespace: namespace,
			_name: name
		}));
	};

	JLRP_Menu_Default.change = function(namespace, name, data) {
		$.post('https://' + JLRP_Menu_Default.ResourceName + '/menu_default_change', JSON.stringify({
			_namespace: namespace,
			_name: name,
			current: data,
			elements: JLRP_Menu_Default.opened[namespace][name].elements
		}));
	};

	JLRP_Menu_Default.getFocused = function() {
		return JLRP_Menu_Default.focus[JLRP_Menu_Default.focus.length - 1];
	};

	window.onDefaultData = function(data) {
		switch (data.action) {

			case 'openMenuDefault': {
				
				JLRP_Menu_Default.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenuDefault': {
				JLRP_Menu_Default.close(data.namespace, data.name);
				break;
			}

			case 'menuDefaultControlPressed': {
				switch (data.control) {

					case 'ENTER': {
						let focused = JLRP_Menu_Default.getFocused();

						if (typeof focused != 'undefined') {
							let menu = JLRP_Menu_Default.opened[focused.namespace][focused.name];
							let pos = JLRP_Menu_Default.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							if (menu.elements.length > 0) {
								JLRP_Menu_Default.submit(focused.namespace, focused.name, elem);
							}
						}

						break;
					}

					case 'BACKSPACE': {
						let focused = JLRP_Menu_Default.getFocused();

						if (typeof focused != 'undefined') {
							JLRP_Menu_Default.cancel(focused.namespace, focused.name);
						}

						break;
					}

					case 'TOP': {
						let focused = JLRP_Menu_Default.getFocused();

						if (typeof focused != 'undefined') {
							let menu = JLRP_Menu_Default.opened[focused.namespace][focused.name];
							let pos = JLRP_Menu_Default.pos[focused.namespace][focused.name];

							if (pos > 0) {
								JLRP_Menu_Default.pos[focused.namespace][focused.name]--;
							} else {
								JLRP_Menu_Default.pos[focused.namespace][focused.name] = menu.elements.length - 1;
							}

							let elem = menu.elements[JLRP_Menu_Default.pos[focused.namespace][focused.name]];

							for (let i = 0; i < menu.elements.length; i++) {
								if (i == JLRP_Menu_Default.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							JLRP_Menu_Default.change(focused.namespace, focused.name, elem);
							JLRP_Menu_Default.render();

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu_default-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'DOWN': {
						let focused = JLRP_Menu_Default.getFocused();

						if (typeof focused != 'undefined') {
							let menu = JLRP_Menu_Default.opened[focused.namespace][focused.name];
							let pos = JLRP_Menu_Default.pos[focused.namespace][focused.name];
							let length = menu.elements.length;

							if (pos < length - 1) {
								JLRP_Menu_Default.pos[focused.namespace][focused.name]++;
							} else {
								JLRP_Menu_Default.pos[focused.namespace][focused.name] = 0;
							}

							let elem = menu.elements[JLRP_Menu_Default.pos[focused.namespace][focused.name]];

							for (let i = 0; i < menu.elements.length; i++) {
								if (i == JLRP_Menu_Default.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							JLRP_Menu_Default.change(focused.namespace, focused.name, elem);
							JLRP_Menu_Default.render();

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu_default-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'LEFT': {
						let focused = JLRP_Menu_Default.getFocused();

						if (typeof focused != 'undefined') {
							let menu = JLRP_Menu_Default.opened[focused.namespace][focused.name];
							let pos = JLRP_Menu_Default.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									let min = (typeof elem.min == 'undefined') ? 0 : elem.min;

									if (elem.value > min) {
										elem.value--;
										JLRP_Menu_Default.change(focused.namespace, focused.name, elem);
									}

									JLRP_Menu_Default.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu_default-item.selected')[0].scrollIntoView();
						}

						break;
					}

					case 'RIGHT': {
						let focused = JLRP_Menu_Default.getFocused();

						if (typeof focused != 'undefined') {
							let menu = JLRP_Menu_Default.opened[focused.namespace][focused.name];
							let pos = JLRP_Menu_Default.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									if (typeof elem.options != 'undefined' && elem.value < elem.options.length - 1) {
										elem.value++;
										JLRP_Menu_Default.change(focused.namespace, focused.name, elem);
									}

									if (typeof elem.max != 'undefined' && elem.value < elem.max) {
										elem.value++;
										JLRP_Menu_Default.change(focused.namespace, focused.name, elem);
									}

									JLRP_Menu_Default.render();
									break;
								}

								default: break;
							}

							$('#menu_' + focused.namespace + '_' + focused.name).find('.menu_default-item.selected')[0].scrollIntoView();
						}

						break;
					}

					default: break;
				}

				break;
			}
		}
	};
	
})();