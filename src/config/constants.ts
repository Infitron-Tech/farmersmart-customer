import { OrderStatus } from "@/types/ApiResponse";

export const fallbackPaginateRes = {
  success: false,
  message: "An error occurred.",
  data: {
    current_page: 0,
    data: [],
    per_page: 0,
    total: 0,
  },
};
export const fallbackPaginateResOfProductReviews = {
  success: false,
  message: "An error occurred.",
  data: {
    current_page: 0,
    data: {
      total_reviews: 0,
      average_rating: "0",
      ratings_breakdown: {
        "1_star": "0",
        "2_star": "0",
        "3_star": "0",
        "4_star": "0",
        "5_star": "0",
      },
      reviews: [],
    },
    per_page: 0,
    total: 0,
  },
};

export const fallbackApiRes = {
  success: false,
  message: "An error occurred.",
  data: undefined,
};

export const fallbackBannerRes = {
  success: false,
  message: "An error occurred.",
  data: {
    current_page: 0,
    data: { top: [], carousel: [], sidebar: [] },
    per_page: 0,
    total: 0,
  },
};

export const orderStatusColorMap = (
  status: OrderStatus | undefined
): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
  switch (status) {
    case "awaiting_store_response":
      return "warning";
    case "ready_for_pickup":
      return "secondary";
    case "assigned":
      return "primary";
    case "out_for_delivery":
      return "warning";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    case "collected":
      return "secondary";
    case "picked_up":
      return "primary";
    default:
      return "default";
  }
};

export const getStatusLabel = (
  status: OrderStatus | string | undefined,
  fulfillmentType?: string
): string => {
  // If no fulfillment type, return formatted status
  if (!fulfillmentType) {
    return (status || "").replace(/_/g, " ").toUpperCase();
  }

  const labels: Record<string, Record<string, string>> = {
    self_pickup: {
      pending: "⏳ Processing",
      awaiting_store_response: "⏱️ Confirming with Store",
      accepted: "✓ Store Confirmed",
      preparing: "📦 Preparing Items",
      collected: "✓ Ready for Pickup",
      picked_up: "🚚 Picked Up",
      delivered: "✓ Delivered",
    },
    farmer_delivery: {
      pending: "⏳ Processing",
      awaiting_store_response: "⏱️ Confirming with Store",
      accepted: "✓ Store Confirmed",
      preparing: "📦 Preparing Items",
      collected: "✓ Ready for Delivery",
      picked_up: "🚚 In Transit",
      out_for_delivery: "⏰ Arriving Soon",
      delivered: "✓ Delivered",
    },
    delivery_boy: {
      pending: "⏳ Processing",
      awaiting_store_response: "⏱️ Confirming with Store",
      accepted: "✓ Store Confirmed",
      preparing: "📦 Preparing Items",
      ready_for_pickup: "✓ Ready for Pickup",
      assigned: "🚚 Assigned",
      out_for_delivery: "⏰ Out for Delivery",
      delivered: "✓ Delivered",
    },
  };

  return (
    labels[fulfillmentType]?.[status as string] ||
    (status || "").replace(/_/g, " ").toUpperCase()
  );
};

export const staticProfileImage =
  "https://i.pravatar.cc/150?u=a042581f4e29026704d";

export const TILE_LAYERS = [
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png",
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
  "https://tiles.stadiamaps.com/tiles/terrain/{z}/{x}/{y}.png",
];

export const staticLat = 6.605874;
export const staticLng = 6.605874;

export const demoEmail = "user@gmail.com";
export const demoPassword = "12345678";
export const demoNumber = "9000000000";
