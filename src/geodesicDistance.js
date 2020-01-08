/**
 * 
 * @param {{lat: number, lng: number}} coordinates of first point
 * @param {{lat: number, lng: number}} coordinates of second point
 */
export default function distance({lat: lat1, lng: lng1}, {lat: lat2, lng: lng2}) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lng2 - lng1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km

	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}