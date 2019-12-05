export default function euclidianDistance({x: x1, y: y1}, {x: x2, y: y2}) {
	const dx = x1 - x2;
	const dy = y1 - y2;
	return Math.sqrt(dx * dx, dy * dy);
}