import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import haversine from 'haversine-distance';

export function useGeoposition(options = {}) {
  const { t } = useI18n();

  const coords = ref({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  });
  const locatedAt = ref(null);
  const error = ref(null);
  const isLoading = ref(false);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 120000,
  };

  let requestId = 0;

  function mapError(err) {
    const out = { code: err.code ?? 0, originalMsg: err.message };
    switch (err.code) {
      case 1:
        out.message = t('gps.errors.PERMISSION_DENIED');
        break;
      case 2:
        out.message = t('gps.errors.POSITION_UNAVAILABLE');
        break;
      case 3:
        out.message = t('gps.errors.TIMEOUT');
        break;
      default:
        out.message = t('gps.errors.UNKNOWN');
        break;
    }
    return out;
  }

  function getPosition(override = {}) {
    const id = ++requestId;
    isLoading.value = true;
    error.value = null;

    if (!navigator.geolocation) {
      error.value = { code: 0, message: 'Geolocation API not supported' };
      isLoading.value = false;
      return Promise.reject(error.value);
    }

    const opts = { ...defaultOptions, ...options, ...override };

    const hardTimeout = new Promise((_, reject) => {
      const extra = 50;
      setTimeout(
        () => {
          reject(
            Object.assign(new Error('Forced geolocation timeout'), { code: 3 }),
          );
        },
        (opts.timeout ?? 0) + extra,
      );
    });

    const browserCall = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });

    return Promise.race([browserCall, hardTimeout])
      .then(pos => {
        if (id !== requestId) return;
        const {
          latitude,
          longitude,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
        } = pos.coords;
        coords.value = {
          latitude,
          longitude,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
        };
        locatedAt.value = pos.timestamp;
      })
      .catch(err => {
        if (id !== requestId) return;
        error.value = mapError(err);
        console.error('Geo error:', error.value);
      })
      .finally(() => {
        if (id === requestId) isLoading.value = false;
      });
  }

  function calculateDistance(positionA, positionB) {
    return haversine(positionA, positionB);
  }

  function getDistanceToLocation(location) {
    if (!coords.value.latitude || !coords.value.longitude) {
      return null;
    }
    if (!location?.latitude || !location?.longitude) {
      return null;
    }
    return calculateDistance(
      { latitude: coords.value.latitude, longitude: coords.value.longitude },
      { latitude: location.latitude, longitude: location.longitude },
    );
  }

  function formatDistance(distanceInMeters) {
    if (distanceInMeters === null || distanceInMeters === undefined) {
      return null;
    }
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} ${t('gps.meters')}`;
    }
    return `${(distanceInMeters / 1000).toFixed(2)} ${t('gps.kilometers')}`;
  }

  return {
    coords,
    locatedAt,
    error,
    isLoading,
    getPosition,
    calculateDistance,
    getDistanceToLocation,
    formatDistance,
  };
}
