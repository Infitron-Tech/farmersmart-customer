import React, { FC, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
  Spinner,
} from "@heroui/react";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { initiateSelfPickup } from "@/routes/api";

interface InitiateSelfPickupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  onSuccess?: () => void;
}

const InitiateSelfPickupModal: FC<InitiateSelfPickupModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleInitiate = async () => {
    setIsLoading(true);
    try {
      const result = await initiateSelfPickup(orderId);

      if (result.success) {
        addToast({
          title: t("delivery.selfPickup.success") || "Success",
          description:
            result.message ||
            (t("delivery.selfPickup.initiateSuccess") ||
              "Order marked as picked up. Please verify items."),
          color: "success",
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        addToast({
          title: t("general.error.title") || "Error",
          description:
            result.message ||
            (t("delivery.selfPickup.initiateFailed") ||
              "Failed to mark order as picked up"),
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      addToast({
        title: t("general.error.title") || "Error",
        description: t("general.error.somethingWentWrong") || "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("delivery.selfPickup.initiate") || "Initiate Self-Pickup"}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("delivery.selfPickup.ready") ||
                  "Your order is ready for pickup"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t("delivery.selfPickup.initiateDescription") ||
                  "Tap 'Confirm Pickup' when you arrive at the store to collect your order."}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {t("delivery.selfPickup.steps") || "What happens next:"}
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4">
              <li className="flex gap-2">
                <span>1.</span>
                <span>
                  {t("delivery.selfPickup.step1") ||
                    "Confirm pickup when you arrive at store"}
                </span>
              </li>
              <li className="flex gap-2">
                <span>2.</span>
                <span>
                  {t("delivery.selfPickup.step2") ||
                    "Collect your order from the store"}
                </span>
              </li>
              <li className="flex gap-2">
                <span>3.</span>
                <span>
                  {t("delivery.selfPickup.step3") ||
                    "Verify items in the next step"}
                </span>
              </li>
            </ul>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={() => onOpenChange(false)}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            color="primary"
            onPress={handleInitiate}
            isDisabled={isLoading}
            startContent={isLoading ? <Spinner size="sm" color="current" /> : null}
          >
            {isLoading
              ? t("common.processing") || "Processing..."
              : t("delivery.selfPickup.confirmPickup") || "Confirm Pickup"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InitiateSelfPickupModal;
