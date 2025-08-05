import resorts from './updated_resorts.json';

export const findAllResorts = (region) => {
    if (region === 'All' || region == null) {
        return resorts;
    } else {
        return resorts.filter(item => item.region === region);
    }
}