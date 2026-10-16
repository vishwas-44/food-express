import { calculateDeliveryQuote } from '../utils/delivery.utils.js';

// POST /api/delivery/quote
export const getDeliveryQuoteController = async (req, res) => {
  try {
    const { subtotal, latitude, longitude } = req.body;

    const quote = calculateDeliveryQuote({
      subtotal,
      latitude,
      longitude,
    });


    return res.status(200).json({
      success: true,
      message: 'Delivery quote calculated successfully.',
      data: quote,
    });
  } catch (error) {
    console.error('Delivery quote error:', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to calculate delivery quote.',
    });
  }
};

// POST /api/delivery/geocode

export const geocodeDeliveryAddressController = async (req, res) => {
  try {
    const {
      address_line1,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (
      !address_line1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim() ||
      !country?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete delivery address.',
      });
    }

    // Try the complete address first, then simpler searches.
    const addressQueries = [
      [
        address_line1,
        city,
        state,
        pincode,
        country,
      ].join(', '),

      [
        city,
        state,
        pincode,
        country,
      ].join(', '),

      [
        pincode,
        city,
        state,
        country,
      ].join(', '),
    ];

    let matchedResult = null;

    for (const query of addressQueries) {
      const url = new URL(
        'https://nominatim.openstreetmap.org/search'
      );

      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'in');

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FoodExpressOrderingWebsite/1.0',
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        console.error(
          'Geocoding provider returned:',
          response.status
        );

        return res.status(502).json({
          success: false,
          message: 'Address lookup service is temporarily unavailable.',
        });
      }

      const results = await response.json();

      if (Array.isArray(results) && results.length > 0) {
        matchedResult = results[0];
        break;
      }
    }

    if (!matchedResult) {
      return res.status(404).json({
        success: false,
        message:
          'Could not locate this address or its locality. Please select your delivery location on a map.',
      });
    }

    const latitude = Number(matchedResult.lat);
    const longitude = Number(matchedResult.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(502).json({
        success: false,
        message: 'The address lookup returned invalid coordinates.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Address coordinates found.',
      data: {
        latitude,
        longitude,
        displayName: matchedResult.display_name,
      },
    });
  } catch (error) {
    console.error('Address geocoding error:', error);

    return res.status(502).json({
      success: false,
      message: 'Unable to locate the delivery address right now.',
    });
  }
};