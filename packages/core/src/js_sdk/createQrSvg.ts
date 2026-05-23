

import type { DrawType, Options } from "qr-code-styling";
import QRCodeStyling from 'qr-code-styling';





export async function createQrSvg(obj: any) : Promise<string> {
	if (!obj?.text) {
		throw new Error('QR text is required');
	}
	
	const qrdata: Partial<Options> = {
		"type": "svg" as DrawType,
		"shape": "square",
		"width": 340,
		"height": 340,
		"data": "",
		"margin": 0,
		"qrOptions": {
			"typeNumber": 0,
			"mode": "Byte",
			"errorCorrectionLevel": "Q"
		},
		"imageOptions": {
			"saveAsBlob": true,
			"hideBackgroundDots": true,
			"imageSize": 0,
			"margin": 0
		},
		"dotsOptions": {
			"type": "dots",
			"color": "#111",
			"roundSize": true,
			"gradient": undefined
		},
		"backgroundOptions": {
			"round": 0,
			"color": "#fff",
			"gradient": undefined
		},
		"image": undefined,
		"cornersSquareOptions": {
			"type": "extra-rounded",
			"color": "#111",
			"gradient": undefined
		},
		"cornersDotOptions": {
			"type": "dot",
			"color": "#111",
			"gradient": undefined
		}
	};
	
	
	if(obj.qrColor){
		qrdata.dotsOptions!.color = obj.qrColor;
		qrdata.cornersSquareOptions!.color = obj.qrColor;
		qrdata.cornersDotOptions!.color = obj.qrColor;
	}
	if(obj.bgColor){
		qrdata.backgroundOptions!.color = obj.bgColor;
	}
	const qr = new QRCodeStyling(
		obj.image?{
			...qrdata, 
			"data": obj.text, 
			"image": obj.image,
			"imageOptions": {
				"saveAsBlob": true,
				"hideBackgroundDots": true,
				"imageSize": 0.14,
				"margin": 4
			},
		}:{
			...qrdata, 
			data: obj.text
		}
	);
	const blob = await qr.getRawData('svg');
	if (!blob || typeof (blob as Blob).text !== 'function') {
		throw new Error('Failed to generate QR SVG');
	}
	const svgText = await (blob as Blob).text();
	return svgText;
}
