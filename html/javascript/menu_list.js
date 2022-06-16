(function(){

	let MenuTpl =
		'<div id="menu_{{_namespace}}_{{_name}}" class="menu_list">' +
			'<table>' +
				'<thead>' +
					'<tr>' +
						'{{#head}}<td>{{content}}</td>{{/head}}' +
					'</tr>' +
				'</thead>'+
				'<tbody>' +
					'{{#rows}}' +
						'<tr>' +
							'{{#cols}}<td>{{{content}}}</td>{{/cols}}' +
						'</tr>' +
					'{{/rows}}' +
				'</tbody>' +
			'</table>' +
		'</div>'
	;

	window.JLRP_Menu_List       = {};
	JLRP_Menu_List.ResourceName = 'JLRP-Menus';
	JLRP_Menu_List.opened       = {};
	JLRP_Menu_List.focus        = [];
	JLRP_Menu_List.data         = {};

	JLRP_Menu_List.open = function(namespace, name, data) {

		if (typeof JLRP_Menu_List.opened[namespace] == 'undefined') {
			JLRP_Menu_List.opened[namespace] = {};
		}

		if (typeof JLRP_Menu_List.opened[namespace][name] != 'undefined') {
			JLRP_Menu_List.close(namespace, name);
		}

		data._namespace = namespace;
		data._name      = name;

		JLRP_Menu_List.opened[namespace][name] = data;

		JLRP_Menu_List.focus.push({
			namespace: namespace,
			name     : name
		});

		document.onkeyup = function(data) {
			if(data.which == 27) {
				let focused = JLRP_Menu_List.getFocused();
				JLRP_Menu_List.cancel(focused.namespace, focused.name);
			}
		};
		
		JLRP_Menu_List.render();
	};

	JLRP_Menu_List.close = function(namespace, name) {
		delete JLRP_Menu_List.opened[namespace][name];

		for (let i = 0; i < JLRP_Menu_List.focus.length; i++) {
			if (JLRP_Menu_List.focus[i].namespace == namespace && JLRP_Menu_List.focus[i].name == name) {
				JLRP_Menu_List.focus.splice(i, 1);
				break;
			}
		}

		JLRP_Menu_List.render();
	};

	JLRP_Menu_List.render = function() {

		let menuContainer       = document.getElementById('list_menus');
		let focused             = JLRP_Menu_List.getFocused();
		menuContainer.innerHTML = '';

		$(menuContainer).hide();

		for (let namespace in JLRP_Menu_List.opened) {
			
			if (typeof JLRP_Menu_List.data[namespace] == 'undefined') {
				JLRP_Menu_List.data[namespace] = {};
			}

			for (let name in JLRP_Menu_List.opened[namespace]) {

				JLRP_Menu_List.data[namespace][name] = [];

				let menuData = JLRP_Menu_List.opened[namespace][name];
				let view = {
					_namespace: menuData._namespace,
					_name     : menuData._name,
					head      : [],
					rows      : []
				};

				for (let i = 0; i < menuData.head.length; i++) {
					let item = {content: menuData.head[i]};
					view.head.push(item);
				}

				for (let i = 0; i < menuData.rows.length; i++) {
					let row  = menuData.rows[i];
					let data = row.data;

					JLRP_Menu_List.data[namespace][name].push(data);

					view.rows.push({cols: []});

					for (let j = 0; j < row.cols.length; j++) {

						let col     = menuData.rows[i].cols[j];
						let regex   = /\{\{(.*?)\|(.*?)\}\}/g;
						let matches = [];
						let match;

						while ((match = regex.exec(col)) != null) {
							matches.push(match);
						}

						for (let k = 0; k < matches.length; k++) {
							col = col.replace('{{' + matches[k][1] + '|' + matches[k][2] + '}}', '<button data-id="' + i + '" data-namespace="' + namespace + '" data-name="' + name + '" data-value="' + matches[k][2] +'">' + matches[k][1] + '</button>');
						}

						view.rows[i].cols.push({data: data, content: col});
					}
				}

				let menu = $(Mustache.render(MenuTpl, view));

				menu.find('button[data-namespace][data-name]').click(function() {
					JLRP_Menu_List.submit($(this).data('namespace'), $(this).data('name'), {
						data : JLRP_Menu_List.data[$(this).data('namespace')][$(this).data('name')][parseInt($(this).data('id'))],
						value: $(this).data('value')
					});
				});

				menu.hide();

				menuContainer.appendChild(menu[0]);
			}
		}

		if (typeof focused != 'undefined') {
			$('#menu_' + focused.namespace + '_' + focused.name).show();
		}

		$(menuContainer).show();
	};

	JLRP_Menu_List.submit = function(namespace, name, data){
		$.post('https://' + JLRP_Menu_List.ResourceName + '/menu_list_submit', JSON.stringify({
			_namespace: namespace,
			_name     : name,
			data      : data.data,
			value     : data.value
		}));
	};

	JLRP_Menu_List.cancel = function(namespace, name){
		$.post('https://' + JLRP_Menu_List.ResourceName + '/menu_list_cancel', JSON.stringify({
			_namespace: namespace,
			_name     : name
		}));
	};

	JLRP_Menu_List.getFocused = function(){
		return JLRP_Menu_List.focus[JLRP_Menu_List.focus.length - 1];
	};

	window.onListData = (data) => {
		switch(data.action){
			case 'openMenuList' : {
				JLRP_Menu_List.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenuList' : {
				JLRP_Menu_List.close(data.namespace, data.name);
				break;
			}
		}
	};	

})();