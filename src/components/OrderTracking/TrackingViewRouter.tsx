import React, { FC } from "react";
import { Order } from "@/types/ApiResponse";
import { Card, CardBody, Alert } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import SelfPickupTrackingView from "@/views/OrderDetailView/SelfPickupTrackingView";
import FarmerDeliveryTrackingView from "@/views/OrderDetailView/FarmerDeliveryTrackingView";

interface TrackingViewRouterProps {
  order: Order;
  onInitiateSelfPickupOpen?: () => void;
  onSelfPickupVerifyOpen?: () => void;
  onFarmerVerifyOpen?: () => void;
  onStatusUpdated?: () => void;
}

/**
 * Router component that displays the correct tracking view based on fulfillment type
 */
const TrackingViewRouter: FC<TrackingViewRouterProps> = ({
  order,
  onInitiateSelfPickupOpen,
  onSelfPickupVerifyOpen,
  onFarmerVerifyOpen,
  onStatusUpdated,
}) => {
  const { t } = useTranslation();

  // Route to correct tracking view based on fulfillment type
  switch (order.fulfillment_type) {
    case "self_pickup":
      return (
        <SelfPickupTrackingView
          order={order}
          onInitiateSelfPickupOpen={onInitiateSelfPickupOpen}
          onSelfPickupVerifyOpen={onSelfPickupVerifyOpen}
          onStatusUpdated={onStatusUpdated}
        />
      );

    case "farmer_delivery":
      return (
        <FarmerDeliveryTrackingView
          order={order}
          onFarmerVerifyOpen={onFarmerVerifyOpen}
        />
      );

    case "delivery_boy":
      // For delivery boy, display basic tracking info
      return (
        <Card shadow="sm" radius="sm">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t("delivery.deliveryBoyTracking") || "Delivery Boy Tracking"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("delivery.deliveryBoyDesc") ||
                    "Use the 'Track Order' button to see real-time location updates from your delivery partner."}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      );

    default:
      return (
        <Alert
          color="warning"
          icon={<AlertCircle className="w-5 h-5" />}
          title={t("delivery.unknownType") || "Unknown Delivery Type"}
          description={
            t("delivery.unknownTypeDesc") ||
            "Unable to determine the delivery method for this order"
          }
          className="mb-4"
        />
      );
  }
};

export default TrackingViewRouter;
