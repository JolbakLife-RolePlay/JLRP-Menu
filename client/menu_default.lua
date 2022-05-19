local GUI, MenuType = {}, 'default'
GUI.Time = 0

local function openMenu(namespace, name, data)
	SendNUIMessage({
		action = 'openMenu',
		namespace = namespace,
		name = name,
		data = data
	})
end

local function closeMenu(namespace, name)
	SendNUIMessage({
		action = 'closeMenu',
		namespace = namespace,
		name = name,
	})
end

Framework.UI.Menu.RegisterType(MenuType, openMenu, closeMenu)

RegisterNUICallback('menu_submit', function(data, cb)
	local menu = Framework.UI.Menu.GetOpened(MenuType, data._namespace, data._name)
	if menu.submit ~= nil then
		menu.submit(data, menu)
	end
	cb('OK')
end)

RegisterNUICallback('menu_cancel', function(data, cb)
	local menu = Framework.UI.Menu.GetOpened(MenuType, data._namespace, data._name)

	if menu.cancel ~= nil then
		menu.cancel(data, menu)
	end
	cb('OK')
end)

RegisterNUICallback('menu_change', function(data, cb)
	local menu = Framework.UI.Menu.GetOpened(MenuType, data._namespace, data._name)

	for i = 1, #data.elements, 1 do
		menu.setElement(i, 'value', data.elements[i].value)

		if data.elements[i].selected then
			menu.setElement(i, 'selected', true)
		else
			menu.setElement(i, 'selected', false)
		end
	end

	if menu.change ~= nil then
		menu.change(data, menu)
	end
	cb('OK')
end)

--await built-in keymanager in JLRP-Framework for optimization
CreateThread(function()
	while true do
		Wait(15)

		if IsControlPressed(0, 201) and IsUsingKeyboard(0) and (GetGameTimer() - GUI.Time) > 150 then
			SendNUIMessage({action = 'controlPressed', control = 'ENTER'})
			GUI.Time = GetGameTimer()
		end

		if IsControlPressed(0, 177) and IsUsingKeyboard(0) and (GetGameTimer() - GUI.Time) > 150 then
			SendNUIMessage({action  = 'controlPressed', control = 'BACKSPACE'})
			GUI.Time = GetGameTimer()
		end

		if IsControlPressed(0, 27) and IsUsingKeyboard(0) and (GetGameTimer() - GUI.Time) > 150 then
			SendNUIMessage({action  = 'controlPressed', control = 'TOP'})
			GUI.Time = GetGameTimer()
		end

		if IsControlPressed(0, 173) and IsUsingKeyboard(0) and (GetGameTimer() - GUI.Time) > 150 then
			SendNUIMessage({action  = 'controlPressed', control = 'DOWN'})
			GUI.Time = GetGameTimer()
		end

		if IsControlPressed(0, 174) and IsUsingKeyboard(0) and (GetGameTimer() - GUI.Time) > 150 then
			SendNUIMessage({action  = 'controlPressed', control = 'LEFT'})
			GUI.Time = GetGameTimer()
		end

		if IsControlPressed(0, 175) and IsUsingKeyboard(0) and (GetGameTimer() - GUI.Time) > 150 then
			SendNUIMessage({action  = 'controlPressed', control = 'RIGHT'})
			GUI.Time = GetGameTimer()
		end
	end
end)