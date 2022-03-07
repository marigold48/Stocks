
import utils from '/k1/libK1_Utils.js'
import sess from '/k1/libK1_Sesion.js'

import {vgApp,goPag} from '/js/stocks_VGlob.js'

window.vgApp = vgApp;
window.goPag = goPag;

/*
Función de retorno de la validación de usr/pwd.
Si OK = false, pone a true el flag error y sale.
Si OK = true, invoca la página adecuada, según el ROL del usuario
Si no está contemplado el ROL, aparecerá el rótulo "usuario/ROL erróneo"
*/
function modSwitch(ok,tipo){
	if (!ok){
		utils.vgk.appLogin.error = true;
		return;
	}
	console.log(ok+':'+tipo);
	switch(utils.vgk.user.rol){
		case 'SYSTEM' :
			window.location = 'system.html?idSess='+utils.vgk.sesion_id;
			break;
		case 'ADMIN' :
			window.location = 'stocks.html?idSess='+utils.vgk.sesion_id;
			break;
		case 'TESTS' :
			window.location = 'testLogin.html';
			break;
		default:
			vgk.appLogin.noRol = true;
	}
}


/*
Función inicial de index.html
En el evento CLICK del botón de login, se invoca la funcion validaUser (libK1_Sesion.js) con los valores de user,pwd
Establece como retorno la función modSwitch, con el resultado de la validación y el ROL de usuario.
*/
function init_Login(){
	var navg = navigator;
	console.log (navg.userAgent);
	console.log (navg.appName+':'+navg.appVersion+':'+navg.appCodeName+':'+navg.platform)
	console.log('Java?: '+navg.javaEnabled());

	utils.vgk.appLogin = new Vue({
		el: '#divLogin',
		data: {
			user  : '', 
			pwd   : '',
			error : false,
			noRol : false
		},
		methods : {
			validaUsrPwd: function(){
				sess.validaUser(this.user,this.pwd,modSwitch);
				} // en libK1_Sesion.js
			}
	}) 
	utils.r$('user').focus();

}

window.onload = init_Login; 
//window.init = init_Login;
//export default {init_Login}
