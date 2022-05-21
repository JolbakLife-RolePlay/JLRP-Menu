fx_version 'cerulean'

game 'gta5'
lua54 'yes'

name 'JLRP-Menu'
author 'Mahan Moulaei'
discord 'Mahan#8183'
description 'JolbakLifeRP Menu'

version '0.0'

shared_scripts {
    '@JLRP-Framework/imports.lua',
	'@JLRP-Framework/shared/locale.lua',
	'locales/*.lua',
	'config.lua'
}

client_scripts {
	'client/menu_default.lua'
}

ui_page {
	'html/ui.html'
}

files {
	'html/ui.html',
	'html/css/*.css',
	'html/fonts/*.ttf',
	'html/javascript/*.js'
}

dependencies {
	'JLRP-Framework'
}
