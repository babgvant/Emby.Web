/**
 * Method signatures:
 *
 * $.nearest({x, y}, selector) - find $(selector) closest to point
 * $(elem).nearest(selector) - find $(selector) closest to elem
 * $(elemSet).nearest({x, y}) - filter $(elemSet) and return closest to point
 *
 * Also:
 * $.furthest()
 * $(elem).furthest()
 *
 * $.touching()
 * $(elem).touching()
 */
; (function ($) {

    function getDocumentWidth() {

        var elem = document;
        var doc = elem.documentElement;
        var name = "Width";

        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
        // whichever is greatest
        return Math.max(
            elem.body["scroll" + name], doc["scroll" + name],
            elem.body["offset" + name], doc["offset" + name],
            doc["client" + name]
        );
    }

    function getDocumentHeight() {

        var elem = document;
        var doc = elem.documentElement;
        var name = "Height";

        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
        // whichever is greatest
        return Math.max(
            elem.body["scroll" + name], doc["scroll" + name],
            elem.body["offset" + name], doc["offset" + name],
            doc["client" + name]
        );
    }

    var rPerc = /^([\d.]+)%$/;
    function nearest(elementInfos, options) {

        var containerOffset = { left: 0, top: 0 },
			containerWH = [
				getDocumentWidth() || 0,
				getDocumentHeight() || 0
			],
			containerProps = {
			    // prop: [min, max]
			    x: [containerOffset.left, containerOffset.left + containerWH[0]],
			    y: [containerOffset.top, containerOffset.top + containerWH[1]],
			    w: [0, containerWH[0]],
			    h: [0, containerWH[1]]
			},
			prop, dims, match;
        for (prop in containerProps) if (containerProps.hasOwnProperty(prop)) {
            match = rPerc.exec(options[prop]);
            if (match) {
                dims = containerProps[prop];
                options[prop] = (dims[1] - dims[0]) * match[1] / 100 + dims[0];
            }
        }

        // Deprecated options - remove in 2.0
        if (options.sameX === false && options.checkHoriz === false) {
            options.sameX = !options.checkHoriz;
        }
        if (options.sameY === false && options.checkVert === false) {
            options.sameY = !options.checkVert;
        }

        // Get elements and work out x/y points
        var cache = [],
			furthest = !!options.furthest,
			checkX = !options.sameX,
			checkY = !options.sameY,
			onlyX = !!options.onlyX,
			onlyY = !!options.onlyY,
			compDist = furthest ? 0 : Infinity,
			point1x = parseFloat(options.x) || 0,
			point1y = parseFloat(options.y) || 0,
			point2x = parseFloat(point1x + options.w) || point1x,
			point2y = parseFloat(point1y + options.h) || point1y,
			tolerance = parseFloat(options.tolerance) || 0,
			// Shortcuts to help with compression
			min = Math.min,
			max = Math.max;

        if (tolerance < 0) {
            tolerance = 0;
        }

        // Loop through all elements and check their positions
        for (var i = 0, length = elementInfos.length; i < length; i++) {

            var elementInfo = elementInfos[i];
            var elem = elementInfo.element;

            var off = elementInfo.clientRect,
                x = off.left,
                y = off.top,
                w = elem.offsetWidth,
                h = elem.offsetHeight,
                x2 = x + w,
                y2 = y + h,
                maxX1 = max(x, point1x),
                minX2 = min(x2, point2x),
                maxY1 = max(y, point1y),
                minY2 = min(y2, point2y),
                intersectX = minX2 >= maxX1,
                intersectY = minY2 >= maxY1,
                distX, distY, distT, isValid;
            if (
                // .nearest() / .furthest()
				(checkX && checkY) ||
                // .touching()
				(!checkX && !checkY && intersectX && intersectY) ||
                // .nearest({sameY: true})
				(checkX && intersectY) ||
                // .nearest({sameX: true})
				(checkY && intersectX) ||
                // .nearest({onlyX: true})
				(checkX && onlyX) ||
                // .nearest({onlyY: true})
				(checkY && onlyY)
			) {
                distX = intersectX ? 0 : maxX1 - minX2;
                distY = intersectY ? 0 : maxY1 - minY2;
                if (onlyX || onlyY) {
                    distT = onlyX ? distX : distY;
                } else {
                    distT = intersectX || intersectY ?
						max(distX, distY) :
						Math.sqrt(distX * distX + distY * distY);
                }
                isValid = furthest ?
					distT >= compDist - tolerance :
					distT <= compDist + tolerance;
                if (isValid) {
                    compDist = furthest ?
						max(compDist, distT) :
						min(compDist, distT);
                    cache.push({
                        node: elem,
                        dist: distT
                    });
                }
            }
        }

        // Make sure all cached items are within tolerance range
        var len = cache.length,
			filtered = [],
			compMin, compMax,
			i, item;
        if (len) {
            if (furthest) {
                compMin = compDist - tolerance;
                compMax = compDist;
            } else {
                compMin = compDist;
                compMax = compDist + tolerance;
            }
            for (i = 0; i < len; i++) {
                item = cache[i];
                if (item.dist >= compMin && item.dist <= compMax) {
                    filtered.push(item.node);
                }
            }
        }
        return filtered;
    }

    window.nearest = nearest;

})();
