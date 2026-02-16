import { useEffect } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getSettings } from "@/routes/api";
import { isSSR } from "@/helpers/getters";
import { Settings } from "@/types/ApiResponse";
import { store } from "@/lib/redux/store";
import { loadTranslations } from "../../i18n";

import LandingPage from "./landing";
import LandingLayout from "@/layouts/landing";

type LandingIndexProps = {
  initialSettings?: Settings | null;
  isLoggedIn?: boolean;
};

/**
 * Landing Page - Default home page
 * Shows landing page to logged-out users
 * Redirects logged-in users to /marketplace
 */
const LandingIndex = ({ isLoggedIn }: LandingIndexProps) => {
  const router = useRouter();

  // Client-side redirect for logged-in users
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/marketplace");
    }
  }, [isLoggedIn, router]);

  // While redirecting, show loading state
  if (isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-gray-600">Redirecting to marketplace...</p>
        </div>
      </div>
    );
  }

  // Show landing page for logged-out users
  return <LandingPage />;
};

// Use LandingLayout
LandingIndex.getLayout = (page: React.ReactNode) => (
  <LandingLayout>{page}</LandingLayout>
);

export const getServerSideProps: GetServerSideProps<LandingIndexProps> | undefined =
  isSSR()
    ? async (context) => {
        try {
          await loadTranslations(context);

          // Fetch settings
          const res = await getSettings();
          const settings = res.success ? res.data : null;

          // Check if user is logged in (check auth state from redux or cookies)
          const authState = store.getState().auth;
          const isLoggedIn = authState?.isLoggedIn || false;

          // Server-side redirect for logged-in users
          if (isLoggedIn) {
            return {
              redirect: {
                destination: "/marketplace",
                permanent: false,
              },
            };
          }

          return {
            props: {
              initialSettings: settings,
              isLoggedIn: false,
            },
          };
        } catch (err) {
          console.error("Error in getServerSideProps:", err);
          return {
            props: {
              initialSettings: null,
              isLoggedIn: false,
            },
          };
        }
      }
    : undefined;

export default LandingIndex;
