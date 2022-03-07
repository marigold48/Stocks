import utils  from '/k1/libK1_Utils.js'
import ajax   from '/k1/libK1_Ajax.js'
import topol  from '/k1/libK1_Topol.js'
import vapps  from '/k1/libK1_vApps.js'

/*
 Un inventario  (Stock) es el conjunto de Items que hay almacenados en un espacio

*/

class Stock extends topol.rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'Stock';
	}

	nodo2vue(nodo,vueObj){
		vueObj.id0 = nodo.id0;
		vueObj.tag = nodo.tag;
		vueObj.iam = nodo.iam;
		if (nodo.iam == 'Item' && nodo.obj.descrip.length>0) vueObj.descrip = '('+nodo.obj.descrip+')';
		vueObj.hijos = [];
		var n = nodo.hijos.length;
		if (!n) return;
		for (var i=0;i<n;i++){
			var nodoH = this.getNodoById(nodo.hijos[i]);
			var vueH = {};
			this.nodo2vue(nodoH,vueH);
			vueObj.hijos.push(vueH);
		}
	}

	reto2vue(){
		var vueObj = {};
		var raiz = this.nodos[0];
		this.nodo2vue(raiz,vueObj);
		return vueObj;
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = objDB.meta.iam;
		this.meta.org = objDB.meta.org;
	}

}

class Factura extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Factura';
		this.obj = {
			provd: '',
			fecha:'', // string dd/mm/aaaa
			numFra:'',
			euros:'',
			PDF : ''  // link a documento PDF
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

class Item extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Item';
		this.obj = {
			tipo: '',
			posic:'',
			descrip:'',
			factura:'', // new Factura
			estado : 'OK'
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

class Chisme extends Item {
	constructor(tag){
		super(tag);
		this.iam = 'Chisme';
		this.obj = {
			marca  : '',
			modelo : '',
			serie  : '',
			manual : '' // link a un documento PDF
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

function initAppsStock(){
	utils.vgk.dataStock = {};

// define the item component
	utils.vgk.itemStock = Vue.component('item', {
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
				return this.model.hijos && this.model.hijos.length;
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
				editItem(this.model);
			}
		} // methods
	}) // Vue.component

// boot up the demo
utils.vgk.appStock = new Vue({
	el: '#stock',
		data: {
			treeData: utils.vgk.dataStock
		},
	methods : {
		actualiza : function(stock){this.treeData = stock}
	}
})

} // function

//===================================================================	Show/Edit Stock (Inventario)

function showStockVue(){
	var vueStock = utils.vgk.stock.reto2vue();
	utils.vgk.appStock.actualiza(vueStock);
}
//------------------------------------------------------------------- Crear Stock / Propietario

function addNuevoItem(id0){
	var item = new Item('Nuevo');
	var padre = utils.vgk.stock.getNodoById(id0);
	utils.vgk.stock.addNodoHijo(padre,item);
	showStockVue();
	updateStock();
}

function grabaNuevoItem(){
	var item = utils.vgk.appEdit.item;

	if (utils.vgk.appEdit.editON) utils.vgk.stock.updtNodoSelf(item);
	else{ 
		alert('No es Edit??');
	}
	showStockVue();
	updateStock();
	utils.vgk.appEdit.showModal = false;

}

function addNuevoHijo(){
	var item = utils.vgk.appEdit.item;

	if (utils.vgk.appEdit.editON){
		var nuevo = new Item('Nuevo');
		utils.vgk.stock.addNodoHijo(item,nuevo);
	}
	else{ 
		alert('No es Edit??');
	}
	showStockVue(utils.vgk.stock);
	updateStock();
	utils.vgk.appEdit.showModal = false;

}

function editItem(model){
	var item = utils.vgk.stock.getNodoById(model.id0);
	utils.vgk.appEdit.item = item;
	utils.vgk.appEdit.edit_t = "ITEM";
	utils.vgk.appEdit.editON = true;
	utils.vgk.appEdit.showModal = true;
}

//------------------------------------------------------------------- CRUD Stocks MongoDB
function ecoGrabaStock(xhr){
	var resp = JSON.parse(xhr.responseText);
	utils.vgk.stock_id = resp._id;

	console.log ('Grabado nuevo stock: ' + resp._id);
	return false;
}

function grabaNuevoStock(lugar){
	var raiz = new topol.rNodo(lugar.tag);
	utils.vgk.stock = new Stock('Stock_'+lugar,[raiz]);
	showStockVue();
	utils.vgk.stock.meta.org = utils.vgk.user.org;

	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoGrabaStock; 
	params.iam = 'Stock';
	params.txt = utils.o2s(utils.vgk.stock.clase2ObjDB());
	ajax.ajaxPostTopol(params);

}



function ecoUpdateStock(xhr){
	var resp = JSON.parse(xhr.responseText);
	console.log('Actualizado stock: ' + resp._id);
	return false;
}

function updateStock(){
	if (utils.vgk.stock.meta.org != utils.vgk.user.org){
		alert('Stock sin ORG:' + utils.vgk.stock.meta.org +':'+ utils.vgk.user.org);
		utils.vgk.stock.meta.org = utils.vgk.user.org;
	};

	var params = vgApp.paramsXHR;
//	params.base = '/testRooms/';
	params.eco = ecoUpdateStock;
	params.txt = utils.o2s(utils.vgk.stock.clase2ObjDB());
	params.topolId = utils.vgk.stock_id;
	ajaxPutTopol(params);
	return false;
}

//------------------------------------------------------------------- Pick Stock
function nuevoStock(){
	grabaNuevoStock('Lugar 1');
}

function ecoGet1Stock(xhr){
		var respTxt = xhr.responseText;
		utils.vgk.loTopol = JSON.parse(respTxt);
		utils.vgk.stock_id = utils.vgk.loTopol._id;
		utils.vgk.stock = new Stock("",[]);
		utils.vgk.stock.objDB2Clase(utils.vgk.loTopol);

		showStockVue();
}

function get1Stock(_id){
	utils.vgk.stock_id = _id;
	var params = vgApp.paramsXHR;
	params.base = '/datos/';
	params.eco = ecoGet1Stock;
	params.topolId = _id;

	ajax.ajaxGet1Topol(params);

	return false;
}


function ecoGetStocks(xhr){
	var respTxt = xhr.responseText;
	var objs = JSON.parse(respTxt);
	var items = [];
	objs.map(function(obj){
		if (obj.meta.org == utils.vgk.user.org && obj.meta.iam == 'Stock') items.push(obj);
	})
	if (!items.length){
		var ok = confirm('No existen Stocks. Crear uno?');
		if (ok)	nuevoStock();
	}
	else if (items.length== 1){get1Stock(items[0]._id);}  // hay un solo stock
	else {
		alert ('Hay varios !!!');
		get1Stock(items[0]._id);
	}
}

function getStocks() {
	var params = vgApp.paramsXHR;
	params.base = '/metas/';
	params.eco = ecoGetStocks;
	params.iam = 'Stock';

	ajax.ajaxGetMetas(params);
 }

export default {initAppsStock,getStocks}