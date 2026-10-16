const EARTH_RADIUS_KM = 6371;

const getConfigNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : fallback;
};

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  return (
    EARTH_RADIUS_KM *
    2 *
    Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))
  );
};

export const calculateDeliveryQuote = ({
  subtotal,
  latitude,
  longitude,
}) => {
  const restaurantLat = Number(process.env.RESTAURANT_LAT);
  const restaurantLng = Number(process.env.RESTAURANT_LNG);

  if (
    !Number.isFinite(restaurantLat) ||
    !Number.isFinite(restaurantLng) ||
    restaurantLat < -90 ||
    restaurantLat > 90 ||
    restaurantLng < -180 ||
    restaurantLng > 180
  ) {
    throw new Error(
      'Please configure valid restaurant coordinates in the server environment.'
    );
  }

  const orderSubtotal = Number(subtotal);
  const customerLat = Number(latitude);
  const customerLng = Number(longitude);

  if (!Number.isFinite(orderSubtotal) || orderSubtotal < 0) {
    throw new Error('Please provide a valid order subtotal.');
  }

  if (
    !Number.isFinite(customerLat) ||
    customerLat < -90 ||
    customerLat > 90 ||
    !Number.isFinite(customerLng) ||
    customerLng < -180 ||
    customerLng > 180
  ) {
    throw new Error(
      'Valid delivery latitude and longitude are required to calculate delivery.'
    );
  }



  const baseFee = 40;
  const baseRadiusKm = 3;
  const extraPerKm = 10;
  const freeDeliveryThreshold = 499;
  const preparationMinutes = getConfigNumber(
    process.env.PREPARATION_TIME_MINUTES,
    15
  );
  const baseTravelMinutes = getConfigNumber(
    process.env.BASE_TRAVEL_TIME_MINUTES,
    25
  );

  const distanceKm = calculateDistanceKm(
    restaurantLat,
    restaurantLng,
    customerLat,
    customerLng
  );

  // ₹40 base fee covers the first 3 km.
  // Each additional started kilometre costs ₹10.
  const extraKm = Math.max(
    0,
    Math.ceil(distanceKm - baseRadiusKm - 1e-9)
  );

  const calculatedFee = baseFee + extraKm * extraPerKm;

  // Free delivery is based on the food subtotal before coupon discount.
  const isFreeDelivery =
    orderSubtotal >= freeDeliveryThreshold;

  const deliveryFee = isFreeDelivery ? 0 : calculatedFee;

  // This is an estimate based on straight-line distance, not road distance.
  const extraTravelMinutes =
    Math.max(0, Math.ceil(distanceKm / 3) - 1) * 5;

  const estimatedTravelMinutes =
    baseTravelMinutes + extraTravelMinutes;

  const estimatedDeliveryMinutes =
    preparationMinutes + estimatedTravelMinutes;

  return {
    eligible: true,
    distanceKm: Number(distanceKm.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    isFreeDelivery,
    freeDeliveryThreshold,
    preparationMinutes,
    estimatedTravelMinutes,
    estimatedDeliveryMinutes,
    taxRate: 0.08,
  };
};