import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import LandingHeader from "@/components/Landing/Header";
import FooterCTA from "@/components/Landing/FooterCTA";
import FooterCTABanner from "@/components/Landing/FooterCTABanner";
import FirebaseInitializer from "@/components/Functional/FirebaseInitializer";
import { getSpecificSettings, isSSR } from "@/helpers/getters";
import { getSettings } from "@/routes/api";
import { Settings, SystemSettings } from "@/types/ApiResponse";
import useSWR from "swr";
import { SEOHead } from "../SEO/SEOHead";
import GoogleMapsScriptLoader from "@/components/Location/GoogleMapsScriptLoader";
import { SettingsProvider } from "@/contexts/SettingsContext";
import WebMaintenanceMode from "@/components/custom/WebMaintenanceMode";
import ScrollToTopButton from "@/components/Functional/ScrollToTopButton";
import { onAppLoad } from "@/helpers/events";
import OfflinePage from "@/components/OfflinePage";
import { maintenanceStore } from "@/stores/maintenanceStore";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from "next/dynamic";
import { initializeUserLocation } from "@/helpers/locationInitializer";
import { getCookie } from "@/lib/cookies";
import { handleLogout } from "@/helpers/auth";

const BottomNavigation = dynamic(
  () => import("@/components/Functional/BottomNavigation"),
  { ssr: false }
);
import CookieConsent from "@/components/Functional/CookieConsent";
import { store } from "@/lib/redux/store";

const RemovedItemsModal = dynamic(
  () => import("@/components/Modals/RemovedItemsModal"),
  { ssr: false }
);

const FailedItemsModal = dynamic(
  () => import("@/components/Modals/FailedItemsModal"),
  { ssr: false }
);

interface LandingLayoutProps {
  children?: React.ReactNode;
  initialSettings?: Settings | null;
  showCTABanner?: boolean;
}

/**
 * LandingLayout - Public landing page layout
 * Uses Landing Header/Footer instead of Navbar/Footer
 * Includes all initialization logic from DefaultLayout
 */
export default function LandingLayout({
  children,
  initialSettings,
  showCTABanner = true,
}: LandingLayoutProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [maintenanceState, setMaintenanceState] = useState(
    maintenanceStore.getState()
  );

  // Force light theme for Landing page to show green branding
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Save current theme and switch to light
    previousThemeRef.current = theme;
    setTheme("light");

    // Restore previous theme when unmounting
    return () => {
      if (previousThemeRef.current) {
        setTheme(previousThemeRef.current);
      }
    };
  }, [theme, setTheme]);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    // defer initial setState to next tick
    const id = requestAnimationFrame(updateOnlineStatus);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch settings
  const fetcher = async () => {
    try {
      const res = await getSettings();
      if (res.success && res.data) {
        return res.data;
      } else {
        console.error("Failed to fetch settings:", res.message);
        return null;
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      return null;
    }
  };

  const { data: settings, isLoading } = useSWR<Settings | null>(
    "/settings",
    fetcher,
    {
      revalidateOnMount: !isSSR(),
      revalidateOnFocus: true,
      focusThrottleInterval: 30000,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000,
      fallbackData: initialSettings ?? null,
    }
  );

  const activeSettings: Settings | null = settings ?? null;

  // Initialize user location on app load
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      initializeUserLocation(activeSettings);
    }
  }, [isLoading, activeSettings]);

  // Fire app load events
  useEffect(() => {
    if (!isLoading) {
      onAppLoad();
    }
  }, [isLoading]);

  // Subscribe to maintenance store changes
  useEffect(() => {
    const unsubscribe = maintenanceStore.subscribe(() => {
      setMaintenanceState(maintenanceStore.getState());
    });
    return unsubscribe;
  }, []);

  // Check auth token validity
  useEffect(() => {
    if (store.getState().auth.isLoggedIn) return;
    const accessToken = getCookie("access_token") as string | undefined;
    if (accessToken) {
      handleLogout(false, true);
    }
  }, []);

  const systemSettings: SystemSettings | undefined = getSpecificSettings(
    activeSettings,
    "system"
  ) as SystemSettings | undefined;

  // Determine maintenance mode
  const isMaintenanceMode =
    maintenanceState.isActive || systemSettings?.webMaintenanceMode || false;

  const maintenanceMessage =
    maintenanceState.message || systemSettings?.webMaintenanceMessage || null;

  return (
    <div className="flex flex-col min-h-screen w-full items-center">
      {!isOnline ? (
        <OfflinePage />
      ) : false && isLoading && !isSSR() ? (
        // Page loader commented out - can be restored later if needed
        // <div className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-white">
        //   {/* Smoke */}
        //   <div className="absolute left-1/2 top-1/2 -translate-x-24 translate-y-4 flex gap-2">
        //     <span className="smoke" />
        //     <span className="smoke delay-150" />
        //     <span className="smoke delay-300" />
        //   </div>
        //   {/* Bike GIF */}
        //   {/* eslint-disable-next-line @next/next/no-img-element */}
        //   <img
        //     src="/logos/logo-loading.gif"
        //     alt="Loading"
        //     className="relative z-10 w-32 h-32"
        //     loading="eager"
        //   />
        //   {/* Road */}
        //   <div className="absolute bottom-[45%] w-72 h-0.5 overflow-hidden hidden">
        //     <div className="road" />
        //   </div>
        // </div>
        <div />
      ) : (
        <>
          {activeSettings && (
            <>
              <FirebaseInitializer settings={activeSettings} />
              <SEOHead settings={activeSettings} />
              <GoogleMapsScriptLoader settings={activeSettings} />
            </>
          )}

          <SettingsProvider settings={activeSettings}>
            {isMaintenanceMode ? (
              <WebMaintenanceMode customMessage={maintenanceMessage} />
            ) : (
              <>
                {/* Landing Header instead of Navbar */}
                <LandingHeader />

                {/* Main content */}
                <main className="w-full grow">
                  {children}
                </main>

                {/* Landing CTA Banner */}
                {showCTABanner && <FooterCTABanner />}

                {/* Landing Footer */}
                <FooterCTA />

                {/* Utilities */}
                <ScrollToTopButton />
                <BottomNavigation />
                <CookieConsent />
                <RemovedItemsModal />
                <FailedItemsModal />
              </>
            )}
          </SettingsProvider>
        </>
      )}

      <SpeedInsights />
    </div>
  );
}
