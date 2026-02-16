import { setCookie, getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import { staticLat, staticLng } from "@/config/constants";
import { Settings } from "@/types/ApiResponse";

/**
 * Initialize user location from default settings
 * This is a standalone function that doesn't depend on React context
 */
export const initializeUserLocation = (settings: Settings | null): void => {
  // Only run on client side
  if (typeof window === "undefined") {
    return;
  }

  try {
    const userLocation = getCookie("userLocation") as UserLocation;

    // Only initialize if location cookie doesn't exist or is incomplete
    if (!userLocation?.lat || !userLocation?.lng) {
      let defaultLat = staticLat;
      let defaultLng = staticLng;

      // Try to extract lat/lng from settings if available
      if (settings && Array.isArray(settings)) {
        try {
          // Settings is an array of setting objects
          const webSetting = settings.find(
            (s: any) => s?.variable === "web"
          ) as any;

          if (webSetting?.value?.defaultLatitude) {
            defaultLat = parseFloat(webSetting.value.defaultLatitude);
          }
          if (webSetting?.value?.defaultLongitude) {
            defaultLng = parseFloat(webSetting.value.defaultLongitude);
          }
        } catch (error) {
          // Silently fail, use defaults
        }
      }

      const defaultLocation: UserLocation = {
        lat: defaultLat,
        lng: defaultLng,
        placeName: "Default Location",
        placeDescription: "",
      };

      setCookie<UserLocation>("userLocation", defaultLocation);
    }
  } catch (error) {
    console.error("Error initializing user location:", error);
  }
};
