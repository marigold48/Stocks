// stocks_Clases.js
//=================================================================== SUELO
/*
Building the regex from the rules (in an order of convenience):

	+ both upper and lower case => use case insensitive flag //i
	+ letters, numbers, underscore and period => [\w.]*
	+ 3-25 characters => ^[\w.]{3,25}$
	+ cannot begin or end with period or underscore => (?!^[\W_]|[W_]$)
		(notice uppercase \W meaning not \w)
	+ cannot contain 2 punctuation in a row => (?![\W_]{2})
	+ checking the negative lookahead in every position => (?:(?!...)[\w.]){3,25}
		(using non-capturing group (?:) instead of () because we don't need to save the group)
	+ at least 2 letters => (?:.*[a-z]){2} assuming i flag

	wrap into lookahead (not consuming any characters) so we can check multiple conditions => (?=(?:...))

The final regex literal:

/^(?=(?:.*[a-z]){2})(?:(?!^[\W_]|[\W_]{2}|[\W_]$)[\w.]){3,25}$/i
Para permitir espacios y no punto: [\w ]
*/

import utils  from '/k1/libK1_Utils.js'
import topol  from '/k1/libK1_Topol.js'
import tempo  from '/k1/libK1_Tiempo.js'
import clases from '/k1/libK1_Clases.js'

//=================================================================== Stocks

class ArbolItems extends topol.rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'ArbolItems';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = objDB.meta.iam;
	}

// procesa recursivamente los nodos del arbol, poniendolos en vueObj
	nodo2vue(nodo,vueObj){
		vueObj.id0 = nodo.id0;
		vueObj.tag = nodo.tag;
		vueObj.iam = nodo.iam;
//		if (nodo.iam == 'Item' && nodo.obj.descrip.length>0) vueObj.descrip = '('+nodo.obj.descrip+')';
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

}

class Invent extends ArbolItems {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'Invent';
	}
	getHojasRama(rama,hojas){
		var n = rama.hijos.length;
		if (!n) {hojas.add(rama); return;} // es una hoja
		for (i=0;i<n;i++){
			var nodo = this.getNodoById(rama.hijos[i]);
			getHojasRama(nodo,hojas);
		}

	}
	getProductos(){
		var prods = []
		var ramaProd = this.getRaspa()[0];
		getHojasRama(ramaProd,prods);
		return prods; 
	}

	getUbicaciones(){
		var ubics = []
		var ramaUbic = this.getRaspa()[1];
		getHojasRama(ramaUbic,ubics);
		return ubics;
	}

}


export class Rama extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Rama';
		this.obj = {
			descripc : '',
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;	
	}
	
	vale(conds){
		console.log(utils.o2s(conds));
		conds.valid.tag.ok =  utils.inputOK('TAG',this.tag);
		conds.valid.descripc.ok = utils.inputOK('DSC',this.obj.descripc);
		return conds;
	}
}

export class Hoja extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'Hoja'
		this.obj = {
			descripc : '',
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;	
	}
	
	vale(conds){
		console.log(utils.o2s(conds));
		conds.valid.tag.ok =  utils.inputOK('TAG',this.tag);
		conds.valid.descripc.ok = utils.inputOK('DSC',this.obj.descripc);
		return conds;
	}

}

//------------------------------------------------------------------- Malla Operario/Apero
class Existencias extends topol.rMallaTree {
	constructor (nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'Existencias';
		this.meta.org = utils.vgk.user.org;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta = objDB.meta;
	}

	onOff(iRow,iCol){
		var cols = this.getNodosCols();
		var rows = this.getNodosRows();
		var row = rows[iRow-1];
		var col = cols[iCol-1];
		console.log('onOff: '+row.id0+':'+col.id0);
		var nudo = this.getNudoByIds(row.id0,col.id0);
		if (nudo) this.borraNudo(nudo);
		else {
			var nudo = new topol.rNudo('Nudo '+iRow+'-'+iCol,row,col,0);
			this.addNudo(nudo);
		}
	}

	getOperarios(apero){
		var operarios = [];
		var aperos = this.getNodosRows();
		var id0Ap = null;
		aperos.map(function(aper){
			if (aper.obj.codTractor == apero) id0Ap = aper.id0;
		})
		if (!id0Ap) {console.log('No existe el apero: '+apero+':'+id0Ap); return operarios;}
		var nodoAp = this.getNodoById(id0Ap);
		var nudos= this.getNudos();
		nudos.map(function(nudo){
			if(nudo.id0I == id0Ap){
				var nodoOp = this.getNodoById(nudo.id0F);
				operarios.push(nodoOp.tag);
			}
		}.bind(this))
		return operarios;
	}
}

//===================================================================  Add Clases a Idiomas

export default {
	Invent,Existencias
}