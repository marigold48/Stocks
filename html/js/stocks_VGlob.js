
import {vgk}  from '/k1/libK1_Utils.js'

export var vgApp = {
	paramsXHR : {
		url : 'http://' + window.location.host,
		base : '/datos',
		otro : '',
		iam : '',
		eco : null
	},
	sqlite : {
		base   : '/shell/sqlite',
		userDB : 'usersStocks.sqlite',
		sessDB : 'sessStocks.sqlite',
		pathDB : 'apps/Stocks/sqlite',
		stmtDB : '',
	},
	encript : {
		base   : '/shell/encript',
	}
}

export function goPag(pag,_id){
	if (vgk.params) var idSess = vgk.params.idSess;
	switch (pag){
	}
}
