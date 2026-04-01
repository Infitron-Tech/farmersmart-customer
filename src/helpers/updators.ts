import {
  clearCart,
  setCartData,
  setCartLoading,
  setError,
} from "@/lib/redux/slices/cartSlice";
import { store } from "@/lib/redux/store";
import { getCart, syncOfflineCart } from "@/routes/api";
import { ApiResponse, CartResponse, CartSyncData } from "@/types/ApiResponse";
import { addToast } from "@heroui/react";
import i18n from "../../i18n";
import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import { resetCheckOutState } from "./functionalHelpers";
import { clearOfflineCart } from "@/lib/redux/slices/offlineCartSlice";

export const updateCartData = async (
  passAddress: boolean = true,
  renderToast: boolean = true,
  customAddress: string | number = 0,
  customRushMode: boolean = true,
  emtyCartToast: boolean = true
): Promise<ApiResponse<CartResponse> | undefined> => {
  try {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🛒 CART UPDATE STARTED");
    console.log("═══════════════════════════════════════════════════════════");

    const isLoggedIn = store.getState().auth.isLoggedIn;
    const address_id = store
      .getState()
      .checkout.selectedAddress?.id?.toString();

    if (!isLoggedIn) {
      console.log("⚠️ User not logged in, skipping cart update");
      return;
    }

    const { lat = "", lng = "" } =
      (getCookie("userLocation") as UserLocation) || {};

    store.dispatch(setCartLoading(true));
    const state = store.getState();
    const use_wallet = state?.checkout?.useWallet || false;
    const rush_delivery = customRushMode
      ? state?.checkout?.rushDelivery || false
      : false;
    const promo_code = state?.checkout?.promoCode || "";
    const fulfillment_type = state?.checkout?.deliveryMethod || "delivery_boy";

    console.log("📊 CART UPDATE PARAMETERS:");
    console.log({
      address_id: customAddress ? customAddress : passAddress ? address_id : "",
      use_wallet,
      rush_delivery,
      promo_code,
      latitude: lat,
      longitude: lng,
      fulfillment_type,
      passAddress,
      customAddress,
    });

    const cartRes: ApiResponse<CartResponse> = await getCart({
      address_id: customAddress ? customAddress : passAddress ? address_id : "",
      use_wallet,
      rush_delivery,
      promo_code,
      latitude: lat,
      longitude: lng,
      fulfillment_type,
    });

    console.log("📨 CART API RESPONSE RECEIVED:");
    console.log({
      success: cartRes.success,
      message: cartRes.message,
      itemsCount: cartRes.data?.items_count || 0,
      totalQuantity: cartRes.data?.total_quantity || 0,
      itemsTotal: cartRes.data?.payment_summary?.items_total || 0,
      deliveryCharges: cartRes.data?.payment_summary?.delivery_charges || 0,
      payableAmount: cartRes.data?.payment_summary?.payable_amount || 0,
      isRushDeliveryAvailable:
        cartRes.data?.payment_summary?.is_rush_delivery_available || false,
    });

    const rushCheck = customAddress || address_id;

    if (cartRes.success && cartRes.data) {
      console.log("✅ CART UPDATED SUCCESSFULLY");
      store.dispatch(setCartData(cartRes.data));
      if (cartRes?.data?.removed_count && cartRes.data.removed_count > 0) {
        console.log("⚠️ Some items were removed from cart");
        document.getElementById("removed-items-modal-open")?.click();
      }
      if (cartRes?.data?.payment_summary?.is_rush_delivery_available) {
        console.log("✨ Rush delivery is available");
        document.getElementById("rush-delivery-available")?.click();
      }
      if (
        !cartRes?.data?.payment_summary?.is_rush_delivery_available &&
        rush_delivery &&
        rushCheck
      ) {
        console.log("❌ Rush delivery not available, disabling");
        if (customAddress) {
          document.getElementById("rush-delivery-off")?.click();
        }

        if (renderToast) {
          addToast({
            title: i18n.t("rushDeliveryUnavailable"),
            color: "danger",
          });
        }
      }
    } else if (!cartRes.success && cartRes.message == "Your cart is empty") {
      console.log("📭 CART IS EMPTY");
      store.dispatch(clearCart());
      resetCheckOutState();
      if (renderToast && emtyCartToast) {
        addToast({
          title: "Cart is Empty",
          description: "Add Product to processed !",
          color: "warning",
        });
      }
    } else {
      console.error("❌ CART FETCH FAILED:", cartRes.message);
      store.dispatch(setError("Failed to fetch updated cart"));
      if (renderToast) {
        addToast({
          title: "Cart Fetch Failed",
          description: "Could not update cart after adding item",
          color: "warning",
        });
      }
    }
    return cartRes;
  } catch (error) {
    console.error("🔥 CART UPDATE ERROR:", error);
  } finally {
    store.dispatch(setCartLoading(false));
  }
};

export const syncOfflineCartToServer = async (): Promise<boolean> => {
  try {
    const offlineCartItems = store.getState().offlineCart.items;

    // If no offline cart items, skip sync
    if (!offlineCartItems || offlineCartItems.length === 0) {
      return true;
    }

    // Transform offline cart items to API format
    const items = offlineCartItems.map((item) => ({
      store_id: item.store_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
    }));

    // Call sync API
    const response: ApiResponse<CartSyncData> = await syncOfflineCart({
      items,
    });

    if (response.success && response.data) {
      // Update cart with the synced cart data
      if (response.data.cart) {
        store.dispatch(setCartData(response.data.cart));
      }

      // Clear offline cart after successful sync
      store.dispatch(clearOfflineCart());

      // Show failed items modal if there are any failed items
      if (response.data.failed_items && response.data.failed_items.length > 0) {
        // Trigger the global modal function
        if (
          typeof window !== "undefined" &&
          (window as any).showFailedItemsModal
        ) {
          (window as any).showFailedItemsModal(response.data.failed_items);
        }
      }

      // Show success message after 3 seconds
      setTimeout(() => {
        addToast({
          title: i18n.t("cart.sync_success_title") || "Cart Synced",
          description:
            i18n.t("cart.sync_success_desc") ||
            "Your cart items have been synced successfully",
          color: "success",
        });
      }, 3000);

      return true;
    } else {
      console.error("Failed to sync offline cart:", response.message);

      // Show error message after 3 seconds
      setTimeout(() => {
        addToast({
          title: i18n.t("cart.sync_error_title") || "Sync Failed",
          description:
            response.message || "Failed to sync your cart. Please try again.",
          color: "warning",
        });
      }, 2000);

      return false;
    }
  } catch (error) {
    console.error("Error syncing offline cart:", error);
    addToast({
      title: i18n.t("cart.sync_error_title") || "Sync Error",
      description:
        i18n.t("cart.sync_error_desc") ||
        "An error occurred while syncing your cart",
      color: "danger",
    });
    return false;
  }
};

export const updateDataOnAuth = async () => {
  if (typeof window === "undefined") return;

  const pathButtonMap: Record<string, string[]> = {
    "/": ["home-products-refetch", "home-sections-refetch"],
    "/products": ["refetch-products-page"],
    "/shopping-list": ["shopping-list-refetch"],
  };

  const normalizePath = (path: string) =>
    path !== "/" ? path.replace(/\/+$/, "") : "/";

  const currentPath = normalizePath(window.location.pathname);

  let buttonIds: string[] = [];

  if (currentPath.startsWith("/feature-sections/")) {
    // Handle dynamic slug
    buttonIds = ["refetch-section-products"];
  } else if (currentPath.startsWith("/products/")) {
    buttonIds = ["similar-products-refetch", "specific-product-refetch"];
  } else if (currentPath.startsWith("/brands/")) {
    buttonIds = ["refetch-brand-products"];
  } else if (currentPath.startsWith("/categories/")) {
    buttonIds = ["category-products-refetch"];
  } else if (currentPath.startsWith("/stores/")) {
    buttonIds = ["refetch-store-products"];
  } else {
    // Handle exact matches
    buttonIds = pathButtonMap[currentPath] || [];
  }

  buttonIds.forEach((id) => document.getElementById(id)?.click?.());
};
