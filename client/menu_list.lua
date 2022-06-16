local MenuType, OpenedMenus = "list", {}

local function openMenuList(namespace, name, data)
    OpenedMenus[namespace .. "_" .. name] = true

    SendNUIMessage({
        action = "openMenuList",
        namespace = namespace,
        name = name,
        data = data
    })

    Framework.SetTimeout(200, function()
        SetNuiFocus(true, true)
    end)
end

local function closeMenuList(namespace, name)
    OpenedMenus[namespace .. "_" .. name] = nil

    SendNUIMessage({
        action = "closeMenuList",
        namespace = namespace,
        name = name
    })

    if Framework.Table.Length(OpenedMenus) <= 0 then
        SetNuiFocus(false)
    end
end

Framework.UI.Menu.RegisterType(MenuType, openMenuList, closeMenuList)

RegisterNUICallback("menu_list_submit", function(data, cb)
    local menu = Framework.UI.Menu.GetOpened(MenuType, data._namespace, data._name)
    
    if menu.submit ~= nil then
        menu.submit(data, menu)
    end
    
    cb("OK")
end)

RegisterNUICallback("menu_list_cancel", function(data, cb)
    local menu = Framework.UI.Menu.GetOpened(MenuType, data._namespace, data._name)
    
    if menu.cancel ~= nil then
        menu.cancel(data, menu)
    end
    
    cb("OK")
end)
