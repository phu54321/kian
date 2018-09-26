/*globals svgEditor, svgCanvas*/
/*jslint eqeq: true*/
/*
 * ext-autozoom.js
 *
 * from ext-panning.js
 *
 */


svgEditor.addExtension('ext-autozoom', function() {
	'use strict';
	console.log(svgEditor.curConfig.extPath + 'ext-autozoom.xml');
	return {
		name: 'Extension Autozoom',
		buttons: [{
			id: 'ext-autozoom',
			type: 'mode',
			title: 'Fit to content',
			icon: svgEditor.curConfig.extPath + 'ext-autozoom.svg',
			events: {
				click: function() {
					svgCanvas.zoomChanged(null, 'canvas');
				}
			}
		}],
	};
});
