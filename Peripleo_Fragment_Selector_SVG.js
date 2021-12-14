// Standardise Fragment Selectors
function standardiseSVG(selector){
	if (selector.type == "SvgSelector") return selector;
	function getPoints([px,py,cx,cy,a,l,h]){ // Calculate tilted box corners
	    var radians = (Math.PI / 180) * a, 
	        cos = Math.cos(radians),
	        sin = Math.sin(radians);
		function rotate(x,y) {
		    var nx = Math.round((cos * (x - cx)) + (sin * (y - cy)) + cx),
		        ny = Math.round((cos * (y - cy)) - (sin * (x - cx)) + cy);
		    return [nx,ny];
		}
		var points = [];
		points.push([cx,cy]);
		points.push(rotate(cx+l,cy));
		points.push(rotate(cx+l,cy-h));
		points.push(rotate(cx,cy-h));
		
		if(px){ // Find linked box vertice closest to point
			var distances = [];
			$.each(points,function(i,point){
				distances.push(Math.sqrt((point[0]-px)**2 + (point[1]-py)**2));
			});
			var min = distances.indexOf(Math.min.apply(null,distances));
			var line = '<defs><marker id="markerCircle" markerWidth="16" markerHeight="16" refX="8" refY="8"><circle cx="8" cy="8" r="5" /></marker></defs><path d="M'+points[min].join(',')+' '+px+','+py+'" style="marker-end: url(#markerArrow);" />';
		}
		
		$.each(points,function(i,v){
			points[i] = v.join(',');
		});
		
		return '<polygon points="'+points.join(' ')+'" />'+ (px ? line : '');
	}
	// selector examples:
	// xywh=pixel:159,72,10,45 // w & h = 0 for point
	// point:159,72
	// rect:x=137,y=1331,w=332,h=1004
	// tbox:x=1229,y=1570,a=-1.431969101380953,l=737,h=150
	// lbox:rx=1220,ry=620,px=610,py=1194,a=0.27186612134806865,l=1281,h=-329 // Oddly, Recogito outputs rx,ry for the point, and px,py for its linked rectangle
	var parameters = Array.from([...selector.value.matchAll(/[=:,](-?[\d.]+)/g)], m => parseFloat(m[1])); // Extracts numeric elements of all of the above patterns.
	var type = selector.value.split(":")[0];
	if (type=='xywh=pixel') type = (parameters[2]==0 & parameters[3]==0) ? 'point' : 'rect';
	switch (type){
	case "point":
		SVG = '<circle cx="'+parameters[0]+'" cy="'+parameters[1]+'" r="5" />';
		break;
	case "rect":
		SVG = '<rect x="'+parameters[0]+'" y="'+parameters[1]+'" width="'+parameters[2]+'" height="'+parameters[3]+'" />';
		break;
	case "tbox":
		parameters = [false,false].concat(parameters);
	case "lbox":
		SVG = getPoints(parameters);
		break;
	default:
		SVG = "ERROR: HANDLE THIS!!!!!!";
		console.log(SVG,selector);
	}
	return {
		"type": "SvgSelector",
		"value": "<svg:svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"#ff0\" fill-opacity=\"0.5\" stroke=\"black\" viewBox=\"0 0 6407 4947\">"+SVG+"</svg:svg>"
	}
}
