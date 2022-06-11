(function () {
	let MenuDialogTpl =
		'<div id="menu_{{_namespace}}_{{_name}}" class="dialog {{#isBig}}big{{/isBig}}">' +
			'<div class="head"><span>{{title}}</span></div>' +
				'{{#isDefault}}<input type="text" name="value" id="inputText"/>{{/isDefault}}' +
				'{{#isBig}}<textarea name="value"/>{{/isBig}}' +
				'<button type="button" name="submit">Submit</button>' +
				'<button type="button" name="cancel">Cancel</button>' +
			'</div>' +
		'</div>'
	;

	window.JLRP_Menu_Dialog = {};
	JLRP_Menu_Dialog.ResourceName = 'JLRP-Menu';
	JLRP_Menu_Dialog.opened = {};
	JLRP_Menu_Dialog.focus = [];
	JLRP_Menu_Dialog.pos = {};

	JLRP_Menu_Dialog.open = function (namespace, name, data) {
		if (typeof JLRP_Menu_Dialog.opened[namespace] == 'undefined') {
			JLRP_Menu_Dialog.opened[namespace] = {};
		}

		if (typeof JLRP_Menu_Dialog.opened[namespace][name] != 'undefined') {
			JLRP_Menu_Dialog.close(namespace, name);
		}

		if (typeof JLRP_Menu_Dialog.pos[namespace] == 'undefined') {
			JLRP_Menu_Dialog.pos[namespace] = {};
		}

		if (typeof data.type == 'undefined') {
			data.type = 'default';
		}

		if (typeof data.align == 'undefined') {
			data.align = 'top-left';
		}

		data._index = JLRP_Menu_Dialog.focus.length;
		data._namespace = namespace;
		data._name = name;

		JLRP_Menu_Dialog.opened[namespace][name] = data;
		JLRP_Menu_Dialog.pos[namespace][name] = 0;

		JLRP_Menu_Dialog.focus.push({
			namespace: namespace,
			name: name
		});

		document.onkeyup = function (key) {
			if (key.which == 27) { // Escape key
				JLRP_Menu_Dialog.cancel(namespace, name, data);
			} else if (key.which == 13) { // Enter key
				JLRP_Menu_Dialog.submit(namespace, name, data);
			}
		};

		JLRP_Menu_Dialog.render();
	};

	JLRP_Menu_Dialog.close = function (namespace, name) {
		delete JLRP_Menu_Dialog.opened[namespace][name];

		for (let i = 0; i < JLRP_Menu_Dialog.focus.length; i++) {
			if (JLRP_Menu_Dialog.focus[i].namespace == namespace && JLRP_Menu_Dialog.focus[i].name == name) {
				JLRP_Menu_Dialog.focus.splice(i, 1);
				break;
			}
		}

		JLRP_Menu_Dialog.render();
	};

	JLRP_Menu_Dialog.render = function () {
		let menuContainer = $('#dialog_menus')[0];
		$(menuContainer).find('button[name="submit"]').unbind('click');
		$(menuContainer).find('button[name="cancel"]').unbind('click');
		$(menuContainer).find('[name="value"]').unbind('input propertychange');
		menuContainer.innerHTML = '';
		$(menuContainer).hide();

		for (let namespace in JLRP_Menu_Dialog.opened) {
			for (let name in JLRP_Menu_Dialog.opened[namespace]) {
				let menuData = JLRP_Menu_Dialog.opened[namespace][name];
				let view = JSON.parse(JSON.stringify(menuData));

				switch (menuData.type) {

					case 'default': {
						view.isDefault = true;
						break;
					}

					case 'big': {
						view.isBig = true;
						break;
					}

					default: break;
				}

				let menu = $(Mustache.render(MenuDialogTpl, view))[0];

				$(menu).css('z-index', 1000 + view._index);

				$(menu).find('button[name="submit"]').click(function () {
					JLRP_Menu_Dialog.submit(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				$(menu).find('button[name="cancel"]').click(function () {
					JLRP_Menu_Dialog.cancel(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				$(menu).find('[name="value"]').bind('input propertychange', function () {
					this.data.value = $(menu).find('[name="value"]').val();
					JLRP_Menu_Dialog.change(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				if (typeof menuData.value != 'undefined') {
					$(menu).find('[name="value"]').val(menuData.value);
				}

				menuContainer.appendChild(menu);
			}
		}

		$(menuContainer).show();
		$("#inputText").focus();
	};

	JLRP_Menu_Dialog.submit = function (namespace, name, data) {
		$.post('https://' + JLRP_Menu_Dialog.ResourceName + '/menu_dialog_submit', JSON.stringify({
			namespace: namespace,
			name: name,
			current: data,
			elements: JLRP_Menu_Dialog.opened[namespace][name].elements
		}));
	};

	JLRP_Menu_Dialog.cancel = function (namespace, name, data) {
		$.post('https://' + JLRP_Menu_Dialog.ResourceName + '/menu_dialog_cancel', JSON.stringify({
			namespace: namespace,
			name: name,
			current: data,
			elements: JLRP_Menu_Dialog.opened[namespace][name].elements
		}));
	};

	JLRP_Menu_Dialog.change = function (namespace, name, data) {
		$.post('https://' + JLRP_Menu_Dialog.ResourceName + '/menu_dialog_change', JSON.stringify({
			namespace: namespace,
			name: name,
			current: data,
			elements: JLRP_Menu_Dialog.opened[namespace][name].elements
		}));
	};

	JLRP_Menu_Dialog.getFocused = function () {
		return JLRP_Menu_Dialog.focus[JLRP_Menu_Dialog.focus.length - 1];
	};

	window.onDialogData = function(data) {
		switch (data.action) {

			case 'openMenuDialog': {
				JLRP_Menu_Dialog.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenuDialog': {
				JLRP_Menu_Dialog.close(data.namespace, data.name);
				break;
			}
		}
	};
	
})();