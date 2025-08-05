export function sort_resorts(resorts, sort_method) {
    const sorted = [...resorts];
    if (sort_method === 'Distance') {
        return sorted.sort((a, b) => a.totalKm - b.totalKm);
    } else {
        return sorted;
    }
}