import React, { FC } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
} from "@heroui/react";
import {
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  MapPinned,
  Store,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Order, OrderItem } from "@/types/ApiResponse";
import { getFormattedDate } from "@/helpers/getters";

interface SelfPickupTrackingViewProps {
  order: Order;
  onStatusUpdated?: () => void;
  onInitiateSelfPickupOpen?: () => void;
  onSelfPickupVerifyOpen?: () => void;
}

interface StatusTimeline {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
  icon: React.ReactNode;
}

const SelfPickupTrackingView: FC<SelfPickupTrackingViewProps> = ({
  order,
  onInitiateSelfPickupOpen,
  onSelfPickupVerifyOpen,
}) => {
  const { t } = useTranslation();

  // Normalize status to lowercase for comparison
  const normalizedStatus = order.status?.toLowerCase() || "";

  // Get the furthest status any item has reached
  const getHighestItemStatus = (): string => {
    const statusOrder = ["awaiting_store_response", "accepted", "preparing", "ready_for_pickup", "collected", "picked_up", "delivered"];
    if (!order.items || order.items.length === 0) return "pending";

    const itemStatuses = order.items.map((item: OrderItem) => item.status);
    for (const status of statusOrder.reverse()) {
      if (itemStatuses.includes(status)) return status;
    }
    return "awaiting_store_response";
  };

  // Determine if any items have been picked up
  const itemsPickedUp = order.items && order.items.some((item: OrderItem) => item.status === "picked_up");
  const highestItemStatus = getHighestItemStatus();

  // Build timeline based on actual item statuses, not order status
  const getTimeline = (): StatusTimeline[] => {
    const timeline: StatusTimeline[] = [
      {
        status: "pending",
        label: t("delivery.selfPickup.processing") || "Processing",
        timestamp: order.created_at,
        completed: true, // Order was always placed/pending at the start
        icon: <Clock className="w-5 h-5" />,
      },
      {
        status: "preparing",
        label: t("delivery.selfPickup.preparing") || "Preparing Items",
        timestamp: ["preparing", "ready_for_pickup", "collected", "picked_up", "delivered"].includes(highestItemStatus) ? order.updated_at : undefined,
        completed: ["preparing", "ready_for_pickup", "collected", "picked_up", "delivered"].includes(highestItemStatus),
        icon: <Store className="w-5 h-5" />,
      },
      {
        status: "collected",
        label: t("delivery.selfPickup.readyPickup") || "Ready for Pickup",
        timestamp: ["ready_for_pickup", "collected", "picked_up", "delivered"].includes(highestItemStatus) ? order.updated_at : undefined,
        completed: ["ready_for_pickup", "collected", "picked_up", "delivered"].includes(highestItemStatus),
        icon: <MapPin className="w-5 h-5" />,
      },
      {
        status: "picked_up",
        label: t("delivery.selfPickup.pickedUp") || "Picked Up",
        timestamp: itemsPickedUp ? order.updated_at : undefined,
        completed: ["picked_up", "delivered"].includes(highestItemStatus),
        icon: <CheckCircle className="w-5 h-5" />,
      },
      {
        status: "delivered",
        label: t("delivery.selfPickup.verified") || "Verified",
        timestamp: highestItemStatus === "delivered" ? order.updated_at : undefined,
        completed: highestItemStatus === "delivered",
        icon: <CheckCircle className="w-5 h-5" />,
      },
    ];

    return timeline;
  };

  const timeline = getTimeline();

  // Current status label
  const getStatusLabel = (): string => {
    switch (order.status) {
      case "pending":
      case "awaiting_store_response":
      case "accepted":
      case "preparing":
        return t("delivery.selfPickup.processing") || "Processing";
      case "ready_for_pickup":
      case "collected":
        return t("delivery.selfPickup.readyPickup") || "Ready for Pickup";
      case "picked_up":
        return t("delivery.selfPickup.pickedUp") || "Picked Up";
      case "delivered":
        return t("delivery.selfPickup.verified") || "Verified";
      default:
        return order.status?.replace(/_/g, " ").toUpperCase() || "Processing";
    }
  };

  // Status color
  const getStatusColor = () => {
    switch (order.status) {
      case "ready_for_pickup":
      case "collected":
        return "warning";
      case "picked_up":
        return "info";
      case "delivered":
        return "success";
      default:
        return "default";
    }
  };

  // Determine which action button to show
  // Show "Initiate Pickup" when order is ready for pickup
  const shouldShowInitiate = normalizedStatus === "ready_for_pickup" || normalizedStatus === "collected";
  // Show "Verify Items" when order has been picked up
  const shouldShowVerify = normalizedStatus === "picked_up";

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
                  startContent={<MapPin className="w-4 h-4" />}
                >
                  {order.fulfillment_type?.replace("_", " ").toUpperCase()}
                </Chip>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("delivery.selfPickup.description") ||
                  "Collect your order from the store location at your convenience"}
              </p>
              {order.updated_at && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {t("lastUpdated")}: {getFormattedDate(order.updated_at)}
                </p>
              )}
            </div>

            {/* Action Button */}
            {shouldShowInitiate && onInitiateSelfPickupOpen && (
              <Button
                color="warning"
                variant="flat"
                startContent={<MapPinned className="w-4 h-4" />}
                onPress={onInitiateSelfPickupOpen}
                className="whitespace-nowrap"
              >
                {t("delivery.selfPickup.initiatePickup") || "Initiate Pickup"}
              </Button>
            )}

            {shouldShowVerify && onSelfPickupVerifyOpen && (
              <Button
                color="primary"
                variant="flat"
                startContent={<CheckCircle className="w-4 h-4" />}
                onPress={onSelfPickupVerifyOpen}
                className="whitespace-nowrap"
              >
                {t("delivery.verifyItems") || "Verify Items"}
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

      {/* Store Location Card */}
      {order.store && (
        <Card shadow="sm" radius="sm">
          <CardHeader className="flex gap-2 items-start pb-2">
            <Store className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("storeLocation") || "Store Location"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {order.store.name}
              </p>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              {order.store.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {t("address")}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {order.store.address}
                    </p>
                  </div>
                </div>
              )}

              {order.store.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {t("contact")}
                    </p>
                    <a
                      href={`tel:${order.store.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {order.store.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

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
                    {step.icon}
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

      {/* Instructions Card */}
      <Card shadow="sm" radius="sm" className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("delivery.selfPickup.instructions") || "How to Pickup"}
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            {normalizedStatus === "collected" && (
              <>
                <li className="flex gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                    1.
                  </span>
                  <span>
                    {t("delivery.selfPickup.step1") ||
                      "Go to the store location at your convenience"}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                    2.
                  </span>
                  <span>
                    {t("delivery.selfPickup.step2") ||
                      "Click 'Initiate Pickup' to start the verification process"}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                    3.
                  </span>
                  <span>
                    {t("delivery.selfPickup.step3") ||
                      "Verify each item condition (Good, Damaged, or Missing)"}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
                    4.
                  </span>
                  <span>
                    {t("delivery.selfPickup.step4") ||
                      "Confirm receipt and take your order"}
                  </span>
                </li>
              </>
            )}

            {normalizedStatus === "picked_up" && (
              <li className="flex gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  {t("delivery.selfPickup.pickedUpMsg") ||
                    "You have successfully picked up your order"}
                </span>
              </li>
            )}

            {normalizedStatus === "delivered" && (
              <li className="flex gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  {t("delivery.selfPickup.verifiedMsg") ||
                    "Your order has been verified successfully"}
                </span>
              </li>
            )}
          </ol>
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
                    item.status === "picked_up"
                      ? "success"
                      : item.status === "collected"
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
    </div>
  );
};

export default SelfPickupTrackingView;
