import utils  from '/k1/libK1_Utils.js'
import sess   from '/k1/libK1_Sesion.js'
import vapps  from '/k1/libK1_vApps.js'
import idioma from '/k1/libK1_Idioma.js'

import src from '/js/stocksSrc.js'

import {Rama,Hoja} from '/js/stocks_Clases.js'

import {vgApp,goPag} from '/js/stocks_VGlob.js'

window.vgApp = vgApp;
window.goPag = goPag;

window.cierraSesion = sess.cierraSesion;
window.cambiaPwdUser = sess.cambiaPwdUser;

window.Rama = Rama;
window.Hoja = Hoja;

//------------------------------------------------------------------- Init
function sesionExpltOK(sesion){
	console.log('Sesion OK');
	console.log('keo:',utils.vgk.user.keo ||'No hay keo');
}

function initExplotacion(){
	vapps.initAppsGlobal();
	src.initAppsInventario();

	sess.validaSesion('usrMenu',sesionExpltOK);
}

window.onload = initExplotacion;
window.showInventario = src.mostrarInvent;
window.regeneraInvent = src.regeneraInvent;
window.addNuevoHijo = src.addNuevoHijo;
window.malla_OxA = src.malla_OxA;


