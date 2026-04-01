import { getOrderStatusBtnConfig } from "@/helpers/getters";
import { Order } from "@/types/ApiResponse";
import { Avatar, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Edit, Phone, Star, Truck, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
interface DeliveryInfoProps {
  order: Order;
  onDeliveryRatingOpen: () => void;
  onInitiateSelfPickupOpen?: () => void;
  onSelfPickupVerifyOpen?: () => void;
  onFarmerVerifyOpen?: () => void;
}
// DeliveryInfo component
const DeliveryInfo: FC<DeliveryInfoProps> = ({
  order,
  onDeliveryRatingOpen,
  onInitiateSelfPickupOpen,
  onSelfPickupVerifyOpen,
  onFarmerVerifyOpen,
}) => {
  const buttonConfig = getOrderStatusBtnConfig(order.status);
  const { t } = useTranslation();

  const isSelfPickupReady =
    order.fulfillment_type === "self_pickup" &&
    order.status === "ready_for_pickup";

  const isSelfPickupDelivered =
    order.fulfillment_type === "self_pickup" &&
    order.status === "delivered";

  // Check if any items have been picked up
  const itemsPickedUp =
    order.items &&
    order.items.some((item: any) => item.status === "picked_up");

  const isFarmerOutForDelivery =
    order.fulfillment_type === "farmer_delivery" &&
    order.status === "out_for_delivery";

  const isFarmerDelivered =
    order.fulfillment_type === "farmer_delivery" &&
    order.status === "delivered";

  return (
    <>
      <Card shadow="sm" radius="sm">
        <CardHeader className="pb-2 flex justify-between w-full items-start">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("delivery_info")}
            </h3>
          </div>
          {isSelfPickupReady && !itemsPickedUp && onInitiateSelfPickupOpen && (
            <Button
              size="sm"
              color="warning"
              variant="flat"
              className="text-xs"
              onPress={onInitiateSelfPickupOpen}
              startContent={<MapPin className="w-4 h-4" />}
            >
              {t("delivery.selfPickup.initiatePickup") || "Initiate Pickup"}
            </Button>
          )}
          {isSelfPickupReady && itemsPickedUp && onSelfPickupVerifyOpen && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="text-xs"
              onPress={onSelfPickupVerifyOpen}
              startContent={<CheckCircle className="w-4 h-4" />}
            >
              {t("delivery.verifyItems") || "Verify Items"}
            </Button>
          )}
          {isSelfPickupDelivered && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>{t("delivery.verified") || "Verified"}</span>
            </div>
          )}
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                {t("fulfillmentType")}
              </span>
              <span className="text-gray-900 dark:text-gray-100 capitalize">
                {order.fulfillment_type?.replace("_", " ")}
              </span>
            </div>
            {buttonConfig.deliveryTime ? (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("estimatedDeliveryTime")}
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {order.estimated_delivery_time
                    ? `${order.estimated_delivery_time} ${t("mins")}`
                    : "TBD"}
                </span>
              </div>
            ) : null}
          </div>
        </CardBody>
      </Card>
      {order.delivery_boy_id && (
        <Card shadow="sm" radius="sm">
          <CardHeader className="pb-2 flex justify-between w-full items-start">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("deliveryPartner")}
              </h3>
            </div>
            {buttonConfig.review &&
              order.delivery_boy_id &&
              !order.is_delivery_feedback_given && (
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="text-xs"
                  onPress={onDeliveryRatingOpen}
                  startContent={<Truck className="w-4 h-4" />}
                  title={t("deliveryReview")}
                >
                  {t("deliveryReview")}
                </Button>
              )}
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-start gap-3">
              <Avatar
                showFallback
                src={order.delivery_boy_profile}
                name={order.delivery_boy_name}
                size="sm"
                className="shrink-0 w-10 h-10 text-xs cursor-pointer"
                title={order.delivery_boy_name}
                onClick={() => {
                  if (order.delivery_boy_profile) {
                    window.open(order.delivery_boy_profile, "_blank");
                  }
                }}
              />
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">
                  {order.delivery_boy_name}
                </div>
                {order.delivery_boy_phone && (
                  <div className="flex items-center gap-1 text-xs">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{order.delivery_boy_phone}</span>
                  </div>
                )}
                {order.delivery_feedback && (
                  <div className="flex items-start w-full justify-between gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">
                          {order.delivery_feedback.rating}/5
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-xs">
                          {order.delivery_feedback.title}
                        </div>
                        <div className="text-xxs text-foreground/50 block ml-1">
                          {order.delivery_feedback.description}
                        </div>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      variant="light"
                      color="primary"
                      size="sm"
                      className="p-0"
                      onPress={onDeliveryRatingOpen}
                      startContent={<Edit className="w-4 h-4" />}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Farmer Delivery Card */}
      {order.delivery_partner_type === "farmer" && order.delivery_partner_id && (
        <Card shadow="sm" radius="sm">
          <CardHeader className="pb-2 flex justify-between w-full items-start">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("delivery.farmerLabel") || "Farmer/Seller"}
              </h3>
            </div>
            {isFarmerOutForDelivery && onFarmerVerifyOpen && (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                className="text-xs"
                onPress={onFarmerVerifyOpen}
                startContent={<CheckCircle className="w-4 h-4" />}
              >
                {t("delivery.completeVerification") || "Verify"}
              </Button>
            )}
            {isFarmerDelivered && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>{t("delivery.verified") || "Verified"}</span>
              </div>
            )}
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("delivery.expectedDelivery") || "Expected Delivery"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {order.estimated_delivery_time
                  ? `${order.estimated_delivery_time} ${t("mins") || "minutes"}`
                  : t("delivery.calculatingTime") || "Calculating..."}
              </p>
              {order.status === "out_for_delivery" && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md mt-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-700 dark:text-orange-300">
                    {t("delivery.farmerOnTheWay") ||
                      "Farmer is on the way to deliver your order"}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default DeliveryInfo;
