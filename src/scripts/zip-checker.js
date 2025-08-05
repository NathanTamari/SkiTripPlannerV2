import zipcodes from './zipcodes.json';

export const findZipLocation = (zipCode) => {

  const record = zipcodes.find(item => String(item.zipcode) === zipCode)
  if (record) {
    return( {
      latitude: record.lat,
      longitude: record.long,
    });
  } else {
    return null;
  }
};
