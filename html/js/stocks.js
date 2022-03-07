
import utils  from '/k1/libK1_Utils.js'
import sess   from '/k1/libK1_Sesion.js'
import vapps  from '/k1/libK1_vApps.js'
import idioma from '/k1/libK1_Idioma.js'

import {vgApp,goPag} from '/js/stocks_VGlob.js'
import {rKeos,rLang,rNodoClase,rTxtML,rTagML,rUsuario} from '/k1/libK1_Clases.js'

import src from '/js/stocksSrc.js'
window.vgApp = vgApp;
window.goPag = goPag;
window.rKeos = rKeos;
window.rLang = rLang;
window.rNodoClase = rNodoClase;
window.rTxtML = rTxtML;
window.rTagML = rTagML;
window.rUsuario = rUsuario;
window.cierraSesion = sess.cierraSesion;
window.cambiaKeoUser = sess.cambiaKeoUser;
window.cambiaPwdUser = sess.cambiaPwdUser;
//------------------------------------------------------------------- Init

function sesionStocksOK(xhr){
	src.initAppsStock();
	src.getStocks();
}




function initStocks(){
//	creaPseudoArbolIdiomas();
	vapps.initAppsGlobal();
	sess.validaSesion('usrMenu', sesionStocksOK); // libK1_sesion.js
}

window.onload = initStocks; 

