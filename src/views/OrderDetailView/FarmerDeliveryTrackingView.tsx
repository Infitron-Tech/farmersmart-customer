import React, { FC } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
} from "@heroui/react";
import {
  Truck,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Store,
  Leaf,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order, OrderItem } from "@/types/ApiResponse";
import { getFormattedDate } from "@/helpers/getters";

interface FarmerDeliveryTrackingViewProps {
  order: Order;
  onFarmerVerifyOpen?: () => void;
}

interface StatusTimeline {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
}

const FarmerDeliveryTrackingView: FC<FarmerDeliveryTrackingViewProps> = ({
  order,
  onFarmerVerifyOpen,
}) => {
  const { t } = useTranslation();

  // Normalize status to lowercase for comparison
  const normalizedStatus = order.status?.toLowerCase() || "";

  // Render icon based on status (inline rendering to avoid React error #418)
  const renderIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "preparing":
        return <Store className="w-5 h-5" />;
      case "collected":
        return <MapPin className="w-5 h-5" />;
      case "picked_up":
        return <Truck className="w-5 h-5" />;
      case "out_for_delivery":
        return <Navigation className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Build timeline based on order status
  const getTimeline = (): StatusTimeline[] => {
    const timeline: StatusTimeline[] = [
      {
        status: "pending",
        label: t("delivery.farmer.processing") || "Processing",
        completed: [
          "pending",
          "awaiting_store_response",
          "accepted",
          "partially_preparing",
          "preparing",
          "collected",
          "picked_up",
          "out_for_delivery",
          "delivered",
          "accepted_by_seller",
        ].includes(normalizedStatus),
      },
      {
        status: "preparing",
        label: t("delivery.farmer.preparing") || "Preparing Items",
        completed: [
          "preparing",
          "collected",
          "picked_up",
          "out_for_delivery",
          "delivered",
        ].includes(normalizedStatus),
      },
      {
        status: "collected",
        label: t("delivery.farmer.readyDelivery") || "Ready for Delivery",
        timestamp: order.updated_at,
        completed: [
          "collected",
          "picked_up",
          "out_for_delivery",
          "delivered",
        ].includes(normalizedStatus),
      },
      {
        status: "picked_up",
        label: t("delivery.farmer.inTransit") || "In Transit",
        timestamp: ["picked_up", "out_for_delivery", "delivered"].includes(
          normalizedStatus
        )
          ? order.updated_at
          : undefined,
        completed: ["out_for_delivery", "delivered"].includes(normalizedStatus),
      },
      {
        status: "out_for_delivery",
        label: t("delivery.farmer.arrivingSoon") || "Arriving Soon",
        timestamp: ["out_for_delivery", "delivered"].includes(normalizedStatus)
          ? order.updated_at
          : undefined,
        completed: normalizedStatus === "delivered",
      },
      {
        status: "delivered",
        label: t("delivery.farmer.delivered") || "Delivered",
        timestamp:
          normalizedStatus === "delivered" ? order.updated_at : undefined,
        completed: normalizedStatus === "delivered",
      },
    ];

    return timeline;
  };

  const timeline = getTimeline();

  // Current status label
  const getStatusLabel = (): string => {
    switch (normalizedStatus) {
      case "collected":
        return t("delivery.farmer.readyDelivery") || "Ready for Delivery";
      case "picked_up":
        return t("delivery.farmer.inTransit") || "In Transit";
      case "out_for_delivery":
        return t("delivery.farmer.arrivingSoon") || "Arriving Soon";
      case "delivered":
        return t("delivery.farmer.delivered") || "Delivered";
      default:
        return t("delivery.farmer.processing") || "Processing";
    }
  };

  // Status color
  const getStatusColor = () => {
    switch (normalizedStatus) {
      case "collected":
        return "warning";
      case "picked_up":
        return "info";
      case "out_for_delivery":
        return "warning";
      case "delivered":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card shadow="sm" radius="sm" className="border-l-4 border-l-primary">
        <CardBody className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getStatusLabel()}
                </h2>
                <Chip
                  color={getStatusColor() as any}
                  variant="flat"
                  size="sm"
                  startContent={<Truck className="w-4 h-4" />}
                >
                  {order.fulfillment_type?.replace("_", " ").toUpperCase()}
                </Chip>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {normalizedStatus === "collected" &&
                  (t("delivery.farmer.descCollected") ||
                    "Your order is prepared and ready for delivery")}
                {normalizedStatus === "picked_up" &&
                  (t("delivery.farmer.descInTransit") ||
                    "Your order is on the way to your location")}
                {normalizedStatus === "out_for_delivery" &&
                  (t("delivery.farmer.descArrivingSoon") ||
                    "Your order will arrive shortly")}
                {normalizedStatus === "delivered" &&
                  (t("delivery.farmer.descDelivered") ||
                    "Your order has been delivered and verified")}
                {![
                  "collected",
                  "picked_up",
                  "out_for_delivery",
                  "delivered",
                ].includes(normalizedStatus) &&
                  (t("delivery.farmer.descProcessing") ||
                    "Your order is being prepared for delivery")}
              </p>
              {order.updated_at && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {t("lastUpdated")}: {getFormattedDate(order.updated_at)}
                </p>
              )}
            </div>

            {/* Verify Button */}
            {normalizedStatus === "out_for_delivery" &&
              onFarmerVerifyOpen && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<CheckCircle className="w-4 h-4" />}
                  onPress={onFarmerVerifyOpen}
                  className="whitespace-nowrap"
                >
                  {t("delivery.completeVerification") || "Verify Receipt"}
                </Button>
              )}

            {normalizedStatus === "delivered" && (
              <div className="flex items-center gap-2 text-green-600 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {t("delivery.verified") || "Verified"}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Farmer/Seller Card */}
      {order.delivery_partner_type === "farmer" &&
        order.delivery_partner_id && (
          <Card shadow="sm" radius="sm">
            <CardHeader className="pb-2 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("delivery.farmerLabel") || "Farmer/Seller"}
              </h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-start gap-4">
                <Avatar
                  showFallback
                  src={order.delivery_partner_profile}
                  name={order.delivery_partner_name}
                  size="lg"
                  className="shrink-0"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {order.delivery_partner_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("delivery.farmerLabel")} • {t("storeOperator")}
                    </p>
                  </div>

                  {order.delivery_partner_phone && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {t("contactFarmer") || "Contact"}
                        </p>
                        <a
                          href={`tel:${order.delivery_partner_phone}`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          {order.delivery_partner_phone}
                        </a>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() =>
                          window.open(`tel:${order.delivery_partner_phone}`)
                        }
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

      {/* Estimated Delivery Time Card */}
      {(normalizedStatus === "picked_up" ||
        normalizedStatus === "out_for_delivery") && (
        <Card shadow="sm" radius="sm" className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("delivery.estimatedDeliveryTime") ||
                "Estimated Delivery Time"}
            </h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <span className="text-sm text-orange-800 dark:text-orange-200">
                {order.estimated_delivery_time
                  ? `${order.estimated_delivery_time} ${t("mins") || "minutes"}`
                  : t("delivery.calculatingTime") || "Calculating..."}
              </span>
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Delivery Address Card */}
      <Card shadow="sm" radius="sm">
        <CardHeader className="flex gap-2 items-start pb-2">
          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("deliveryAddress") || "Delivery Address"}
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {order.shipping_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {order.shipping_address_1}
              {order.shipping_address_2 && `, ${order.shipping_address_2}`}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {order.shipping_landmark && `${order.shipping_landmark}, `}
              {order.shipping_city}, {order.shipping_state}{" "}
              {order.shipping_zip}
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Phone className="w-4 h-4 text-gray-500" />
              <a
                href={`tel:${order.shipping_phone}`}
                className="text-sm text-primary hover:underline"
              >
                {order.shipping_phone}
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Timeline Card */}
      <Card shadow="sm" radius="sm">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("timeline") || "Timeline"}
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div key={step.status} className="flex gap-4">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {renderIcon(step.status)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={`w-0.5 h-16 my-1 ${
                        step.completed
                          ? "bg-green-200 dark:bg-green-900/40"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>

                {/* Timeline content */}
                <div className="flex-1 pt-1">
                  <p
                    className={`text-sm font-medium ${
                      step.completed
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {getFormattedDate(step.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Items Summary */}
      <Card shadow="sm" radius="sm">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("orderItems")} ({order.items?.length || 0})
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.items?.map((item: OrderItem) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("quantity")}: {item.quantity}
                  </p>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    item.status === "delivered"
                      ? "success"
                      : item.status === "picked_up"
                        ? "primary"
                        : item.status === "out_for_delivery"
                          ? "warning"
                          : "default"
                  }
                >
                  {item.status?.replace("_", " ")}
                </Chip>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Instructions Card */}
      <Card shadow="sm" radius="sm" className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("delivery.farmerInstructions") || "Farmer Delivery Info"}
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                •
              </span>
              <span>
                {t("delivery.farmerInfo1") ||
                  "The farmer will deliver your order directly to your location"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                •
              </span>
              <span>
                {t("delivery.farmerInfo2") ||
                  "You can contact the farmer directly for delivery updates"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                •
              </span>
              <span>
                {t("delivery.farmerInfo3") ||
                  "Verify items when delivered and confirm receipt"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                •
              </span>
              <span>
                {t("delivery.farmerInfo4") ||
                  "Keep your phone available for delivery confirmation"}
              </span>
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

export default FarmerDeliveryTrackingView;
