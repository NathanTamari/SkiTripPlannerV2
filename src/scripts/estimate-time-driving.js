    export function findDrivingTime(lat1, long1, lat2, long2) {
        const R = 6371;
        const toRad = angle => (angle * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLong = toRad(long2-long1);  

        const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
    }

    export function estimateDrivingTime (lat1, long1, lat2, long2, avgSpeed=80) {
        const distance = findDrivingTime(lat1, long1, lat2, long2);
        const drivingTimeHours = distance/avgSpeed;
        const totalMins = Math.round(drivingTimeHours*60 / 15 ) * 15;
        const hours = Math.floor(totalMins / 60);
        const minutes = totalMins % 60;


        if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
        else if (hours > 0) return `${hours} hr`;
        else return `${minutes} min`
    }