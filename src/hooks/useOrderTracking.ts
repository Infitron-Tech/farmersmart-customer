import { useState, useEffect, useCallback } from "react";
import { Order } from "@/types/ApiResponse";
import { getSpecificOrders } from "@/routes/api";

export interface TrackingData {
  fulfillment_type: string;
  current_status: string;
  status_label: string;
  timeline?: Array<{
    status: string;
    label: string;
    timestamp?: string;
    completed: boolean;
  }>;
  next_action?: string;
  store_info?: any;
  farmer_info?: any;
}

interface UseOrderTrackingReturn {
  order: Order | null;
  tracking: TrackingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Hook to fetch and track order details
 * Automatically refetches every 30 seconds if order status is not delivered
 */
export function useOrderTracking(
  orderSlug: string | undefined | null
): UseOrderTrackingReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build tracking data from order
  const buildTrackingData = useCallback(
    (orderData: Order): TrackingData => {
      const fulfillmentType = orderData.fulfillment_type || "delivery_boy";

      // Determine status label
      const getStatusLabel = (): string => {
        switch (fulfillmentType) {
          case "self_pickup":
            if (orderData.status === "collected")
              return "Ready for Pickup";
            if (orderData.status === "picked_up")
              return "Picked Up";
            if (orderData.status === "delivered")
              return "Verified";
            break;
          case "farmer_delivery":
            if (orderData.status === "collected")
              return "Ready for Delivery";
            if (orderData.status === "picked_up")
              return "In Transit";
            if (orderData.status === "out_for_delivery")
              return "Arriving Soon";
            if (orderData.status === "delivered")
              return "Delivered";
            break;
          case "delivery_boy":
            if (orderData.status === "out_for_delivery")
              return "Out for Delivery";
            if (orderData.status === "delivered")
              return "Delivered";
            break;
        }

        return orderData.status?.replace("_", " ").toUpperCase() || "Processing";
      };

      // Determine next action
      const getNextAction = (): string => {
        switch (fulfillmentType) {
          case "self_pickup":
            if (orderData.status === "collected")
              return "initiate_pickup";
            if (orderData.status === "picked_up")
              return "verify_items";
            break;
          case "farmer_delivery":
            if (orderData.status === "out_for_delivery")
              return "verify_delivery";
            break;
          case "delivery_boy":
            if (orderData.status === "out_for_delivery")
              return "wait_for_delivery";
            break;
        }

        return "none";
      };

      return {
        fulfillment_type: fulfillmentType,
        current_status: orderData.status || "pending",
        status_label: getStatusLabel(),
        next_action: getNextAction(),
        store_info: orderData.store,
        farmer_info: {
          name: orderData.delivery_partner_name,
          phone: orderData.delivery_partner_phone,
          profile: orderData.delivery_partner_profile,
        },
      };
    },
    []
  );

  // Fetch order details
  const fetchTracking = useCallback(async () => {
    if (!orderSlug) {
      setError("Order slug is required");
      setLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setError(null);

      const response = await getSpecificOrders({
        slug: orderSlug,
      });

      if (response.success && response.data) {
        setOrder(response.data);
        setTracking(buildTrackingData(response.data));
      } else {
        setError(
          response.message || "Failed to fetch order details"
        );
      }
    } catch (err: any) {
      console.error("Error fetching order tracking:", err);
      setError(
        err.message || "Unable to load order details. Please try again later."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderSlug, buildTrackingData]);

  // Initial fetch
  useEffect(() => {
    if (orderSlug) {
      fetchTracking();
    }
  }, [orderSlug, fetchTracking]);

  // Auto-refresh every 30 seconds if order is not delivered
  useEffect(() => {
    if (!orderSlug || order?.status === "delivered" || order?.status === "cancelled") {
      return;
    }

    const interval = setInterval(() => {
      fetchTracking();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [orderSlug, order?.status, fetchTracking]);

  return {
    order,
    tracking,
    loading,
    error,
    refetch: fetchTracking,
    isRefreshing,
  };
}
