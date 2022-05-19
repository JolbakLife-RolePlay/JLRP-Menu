local GUI_Time, MenuType = 0, 'default'

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

RegisterNetEvent('onKeyDown')
AddEventHandler('onKeyDown', function(key)
	if key == 'return' and ((GetGameTimer() - GUI_Time) > 150) then -- enter
        SendNUIMessage({action = 'controlPressed', control = 'ENTER'})
        GUI_Time = GetGameTimer()
    elseif key == 'back' and ((GetGameTimer() - GUI_Time) > 150) then -- backspace
        SendNUIMessage({action  = 'controlPressed', control = 'BACKSPACE'})
        GUI_Time = GetGameTimer()
    elseif key == 'up' and ((GetGameTimer() - GUI_Time) > 150) then -- up arrow
        SendNUIMessage({action  = 'controlPressed', control = 'TOP'})
        GUI_Time = GetGameTimer()
    elseif key == 'down' and ((GetGameTimer() - GUI_Time) > 150) then -- down arrow
        SendNUIMessage({action  = 'controlPressed', control = 'DOWN'})
        GUI_Time = GetGameTimer()
    elseif key == 'left' and ((GetGameTimer() - GUI_Time) > 150) then -- left arrow
        SendNUIMessage({action  = 'controlPressed', control = 'LEFT'})
        GUI_Time = GetGameTimer()
    elseif key == 'right' and ((GetGameTimer() - GUI_Time) > 150) then -- right arrow
        SendNUIMessage({action  = 'controlPressed', control = 'RIGHT'})
        GUI_Time = GetGameTimer()
    end
end)