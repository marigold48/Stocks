import utils  from '/k1/libK1_Utils.js'
import ajax   from '/k1/libK1_Ajax.js'
import topol  from '/k1/libK1_Topol.js'
import vapps  from '/k1/libK1_vApps.js'

import stok from '/js/stocks_Clases.js'


function initAppsInventario(){
	utils.vgk.dataInventario = {};

// define the item component
	utils.vgk.item = Vue.component('item', {
		template: '#item-template',
		props: {
			model: Object
		},
		data: function () {
			return {
				open: false
			}
		},
		computed: {
			isFolder: function () {
				return (this.model.iam == 'Rama');
			}
		},
		methods: {
			toggle: function () {
				if (this.isFolder) this.open = !this.open;
			},
			changeType: function () {
				if (!this.isFolder) {
					Vue.set(this.model, 'hijos', []);
						this.addChild();
						this.open = true;
					}
				},
			addChild: function () {
				addNuevoItem(this.model.id0);
			},
			editItem: function () {
				var item = utils.vgk.invent.getNodoById(this.model.id0);
				if (item.iam == 'Rama') editarRama(item);
				else editarHoja(item);
			}
		} // methods
	}) // Vue.component

	utils.vgk.appInventario = new Vue({
		el: '#appInvent',
			data: {
				treeData: utils.vgk.dataInventario
			},
		methods : {
			actualiza : function(arbol){this.treeData = arbol}
		}
	})

	utils.vgk.appMalla = new Vue({
		el: "#appMalla",
		data:{
			tabla : []
		},
		methods : {
			grabaMallaOA(){updateMallaOA()},
			regenMallaOA(){nuevaMallaOA()},
			onOff : function(iRow,iCol){
				if (!iRow || !iCol) return;
				utils.vgk.mallaOA.onOff(iRow,iCol);
				utils.vgk.appMalla.tabla = utils.vgk.mallaOA.getMatrizVue(true);
			}
		}
	})

} // function


//===================================================================	Show/Edit (Inventario)

function showInventario(){
	utils.vgk.appInventario.actualiza(utils.vgk.invent.reto2vue());
}
//------------------------------------------------------------------- Crear / Propietario
// Pasa por editItem, en libK1_vApps.js
function borraItem(){
	var item = utils.vgk.appModal.item;
	utils.vgk.invent.borraNodo(item);
	showInventario(utils.vgk.modoExplt);
	updateInventario();
	utils.vgk.appModal.show = false;
}

// Pasa por editItem, en libK1_vApps.js
function grabaNuevoItem(){
	var item = utils.vgk.appModal.item;

	utils.vgk.invent.updtNodoSelf(item);
	showInventario(utils.vgk.modoExplt);
	updateInventario();
	utils.vgk.appModal.show = false;

}

// No pasa por editItem, en libK1_vApps.js
function addNuevoHijo(tipo){
	var item = utils.vgk.appModal.item;

	if (utils.vgk.appModal.editON){
		if (tipo == 'RAMA') var nuevo = new Rama(item.tag);
		else var nuevo = new Hoja (item.tag);
		utils.vgk.invent.addNodoHijo(item,nuevo);
	}
	else{ 
		alert('No es Edit??');
	}
	showInventario(utils.vgk.modoExplt);
	updateInventario();
	utils.vgk.appModal.show = false;

}

function editarRama(item){
	console.log('editarRama');
	vapps.editaItem('RAMA',item,grabaNuevoItem,borraItem);
}

function editarHoja(item){
	console.log('editarHoja');
	vapps.editaItem('HOJA',item,grabaNuevoItem,borraItem);
}

//------------------------------------------------------------------- Nuevo Inventario
function ecoGrabaInvent(xhr){
	var resp = JSON.parse(xhr.responseText);
	utils.vgk.invent_id = resp._id;
	console.log ('Grabado nuevo inventario: ' + resp._id);
	return false;
}

function grabaNuevoInvent(){
	var raiz = new Rama('Inventario');
	utils.vgk.invent = new stok.Invent('Invent_'+utils.vgk.user.org,[raiz]);

	var prods = new Rama('Productos');
	utils.vgk.invent.addNodoHijo(raiz,prods);

	var ubics = new Rama('Ubicaciones');
	utils.vgk.invent.addNodoHijo(raiz,ubics);

	showInventario();

	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoGrabaInvent; 
	params.txt = utils.o2s(utils.vgk.invent.clase2ObjDB());
	if (utils.vgk.invent_id){
		params.topolId = utils.vgk.invent_id;
		ajax.ajaxPutTopol(params);
	}
	else ajax.ajaxPostTopol(params);

	utils.vgk.appModal.show = false;
}

function regeneraInvent(){
	grabaNuevoInvent();
}
//------------------------------------------------------------------- Update Inventario

function ecoUpdateInventario(xhr){
	var resp = JSON.parse(xhr.responseText);
	console.log('Actualizado: ' + resp.meta.tag+ ' :: ' +resp._id);
	return false;
}

function updateInventario(){
	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoUpdateInventario;
	params.txt = utils.o2s(utils.vgk.invent.clase2ObjDB());
	params.topolId = utils.vgk.invent_id;
	ajax.ajaxPutTopol(params);
	return false;
}

//------------------------------------------------------------------- Pick CCPAE
function ecoGetInventario(xhr){
	var loTopol = JSON.parse(xhr.responseText);
	console.log(utils.o2s(loTopol.meta));
	utils.vgk.invent_id = loTopol._id;
	utils.vgk.invent = new stok.Invent("",[]);
	utils.vgk.invent.objDB2Clase(loTopol);
	showInventario();
}


//------------------------------------------------------------------- Get Invents
function getUnInvent(_id){
	utils.vgk.invent_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoGetInventario;
	params.topolId = _id;

	ajax.ajaxGet1Topol(params);

	return false;
}
function ecoGetInvents(xhr){
	var objs = JSON.parse(xhr.responseText);
	if (!objs.length){
		var ok = confirm('No existe Inventario. Crearlo?');
		if (ok)	grabaNuevoInvent();
	}
	else if (objs.length== 1){getUnInvent(objs[0]._id);}  // hay un solo inventario (Normal)
	else {
		alert ('Hay varios !!!'); // No es normal
		getUnInvent(objs[0]._id);
	}
}

function ajaxGetInvents() {
	var params = vgApp.paramsXHR;
	params.base = '/metasByOrg/';
	params.eco = ecoGetInvents;
	params.iam = 'Invent';
	params.org = utils.vgk.user.org;

	ajax.ajaxGetMetasByOrg(params);
 }



//------------------------------------------------------------------- Mostrar

function mostrarInvent(){
	ajaxGetInvents();
}

//------------------------------------------------------------------- Malla Operarios/Aperos


function ecoUpdateMallaOA(xhr){
	var resp = JSON.parse(xhr.responseText);
	utils.vgk.mallaOA_id = resp._id;
	console.log('Actualizado: ' + resp.meta.tag+ ' :: ' +resp._id);
	return false;
}

function updateMallaOA(){
	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoUpdateMallaOA;
	params.txt = utils.o2s(utils.vgk.mallaOA.clase2ObjDB());
	if (utils.vgk.mallaOA_id){
		params.topolId = utils.vgk.mallaOA_id;
		ajax.ajaxPutTopol(params);
	}
	else ajax.ajaxPostTopol(params);
	return false;
}

function ecoGetMallaOA(xhr){
	utils.vgk.loTopol = JSON.parse(xhr.responseText);
	console.log(utils.o2s(utils.vgk.loTopol.meta));
	utils.vgk.mallaOA_id = utils.vgk.loTopol._id;
	utils.vgk.mallaOA = new stok.MallaOA("",[]);

	utils.vgk.mallaOA.objDB2Clase(utils.vgk.loTopol);
	
	var nudos= utils.vgk.mallaOA.getNudos();
	nudos.map(function(nudo){
		console.log(utils.o2s(nudo));
	})

	utils.vgk.appMalla.tabla = utils.vgk.mallaOA.getMatrizVue(true);
}


function get1mallaOA(_id){
	utils.vgk.invent_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoGetMallaOA;
	params.topolId = _id;

	ajax.ajaxGet1Topol(params);

	return false;
}
function ecoGetMallasOA(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
		if (obj.meta.org == utils.vgk.user.org && obj.meta.iam == 'MallaOA') items.push(obj);
	})
	if (!items.length){
		var ok = confirm('No existe Malla Op/Aperos. Crearla?');
		if (ok)	nuevaMallaOA();
	}
	else if (items.length== 1){get1mallaOA(items[0]._id);}  // hay una sola lista
	else {
		alert ('Hay varios !!!');
		get1mallaOA(items[0]._id);
	}
}

function ajaxGetMallasOA() {
	var params = vgApp.paramsXHR;
	params.base = '/metas/';
	params.eco = ecoGetMallasOA;
	params.iam = 'MallaOA';

	ajax.ajaxGetMetas(params);
 }

function malla_OxA(){
	ajaxGetMallasOA();
}

function regeneraExists(){
	nuevaMallaOA();
}

function nuevaMallaOA(){
	var rows = [];
	var cols = [];
	var raspa = utils.vgk.invent.getRaspa();
	raspa.map(function(nodo){
//		if (nodo.obj.iamHijos == 'Productos') rows = utils.vgk.invent.getHijosNodo(nodo);
//		else (nodo.obj.iamHijos == 'Ubicaciones') cols = utils.vgk.invent.getHijosNodo(nodo);
	})
	var raiz = new topol.rNodo('Existencias');
	var mallaOA = new stok.MallaOA('Stock_'+utils.vgk.user.org,[raiz]);

	rows.map(function(row){
		mallaOA.addNodoRow(row);
	})

	console.log(utils.o2s(cols));
	cols.map(function(col){
		mallaOA.addNodoCol(col);
	})

	utils.vgk.appMalla.tabla = mallaOA.getMatrizVue(true);
	utils.vgk.mallaOA = mallaOA;

	updateMallaOA();
}
//------------------------------------------------------------------- Export default
export default {
	initAppsInventario,
	ajaxGetInvents,
	mostrarInvent,	malla_OxA,
	regeneraInvent,regeneraExists,
	addNuevoHijo

}

