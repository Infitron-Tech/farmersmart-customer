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
  Card,
  CardBody,
  Input,
  Textarea,
} from "@heroui/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { completeSelfPickupVerification } from "@/routes/api";

interface SelfPickupVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderItems: any[];
  onSuccess?: () => void;
}

interface ItemVerification {
  item_id: number;
  condition: "good" | "damaged" | "missing";
}

interface Discrepancy {
  item_id?: number;
  type: "missing" | "damaged" | "wrong_item" | "wrong_qty";
  expected_qty?: number;
  actual_qty?: number;
  notes?: string;
}

const SelfPickupVerificationModal: FC<SelfPickupVerificationModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  orderItems,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState<ItemVerification[]>([]);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [discrepancyNotes, setDiscrepancyNotes] = useState<{
    [key: number]: string;
  }>({});

  const handleItemCondition = (itemId: number, condition: "good" | "damaged" | "missing") => {
    setVerifiedItems((prev) => {
      const existing = prev.find((v) => v.item_id === itemId);
      if (existing) {
        return prev.map((v) =>
          v.item_id === itemId ? { ...v, condition } : v
        );
      }
      return [...prev, { item_id: itemId, condition }];
    });

    // If item is marked as damaged or missing, expand for discrepancy details
    if (condition !== "good") {
      setExpandedItemId(itemId);
    }
  };

  const addDiscrepancy = (itemId: number, type: "missing" | "damaged" | "wrong_item" | "wrong_qty") => {
    const item = orderItems.find((i) => i.id === itemId);
    if (!item) return;

    setDiscrepancies((prev) => [
      ...prev,
      {
        item_id: itemId,
        type,
        expected_qty: item.quantity,
        actual_qty: 0,
        notes: "",
      },
    ]);
  };

  const updateDiscrepancy = (
    index: number,
    field: string,
    value: any
  ) => {
    setDiscrepancies((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const removeDiscrepancy = (index: number) => {
    setDiscrepancies((prev) => prev.filter((_, i) => i !== index));
  };

  const allItemsVerified = () => {
    return (
      verifiedItems.length === orderItems.length &&
      verifiedItems.every((v) => v.condition !== undefined)
    );
  };

  const handleSubmit = async () => {
    if (!allItemsVerified()) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description:
          t("delivery.verifyAllItems") ||
          "Please verify all items before submitting",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeSelfPickupVerification({
        order_id: orderId,
        verified_items: verifiedItems.map((v) => ({
          item_id: v.item_id,
          condition: v.condition,
        })),
        discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
      });

      if (result.success) {
        addToast({
          title: t("delivery.verification.success.title") || "Success",
          description:
            t("delivery.selfPickup.verified") ||
            "Self-pickup verified successfully",
          color: "success",
        });
        handleClose();
        onSuccess?.();
      } else {
        addToast({
          title: t("delivery.verification.failed.title") || "Verification Failed",
          description:
            result.message ||
            t("delivery.verification.failed.description") ||
            "Failed to complete verification",
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

  const handleClose = () => {
    onOpenChange(false);
    // Reset form
    setVerifiedItems([]);
    setDiscrepancies([]);
    setExpandedItemId(null);
    setDiscrepancyNotes({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("delivery.selfPickup.verify") || "Verify Self-Pickup Items"}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              {t("delivery.selfPickup.verifyDescription") ||
                "Please verify the condition of each item you've picked up. Mark any discrepancies found."}
            </p>
          </div>

          {/* Items Verification */}
          <div className="space-y-3">
            {orderItems.map((item) => {
              const itemVerification = verifiedItems.find(
                (v) => v.item_id === item.id
              );
              const hasDiscrepancies = discrepancies.some(
                (d) => d.item_id === item.id
              );

              return (
                <Card key={item.id} className="border">
                  <CardBody className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product?.name || item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("quantity")}: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {itemVerification?.condition === "good" && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {(itemVerification?.condition === "damaged" ||
                          itemVerification?.condition === "missing") && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Condition Selection */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={`text-xs flex-1 ${
                          itemVerification?.condition === "good"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100"
                        }`}
                        onPress={() => handleItemCondition(item.id, "good")}
                      >
                        {t("delivery.condition.good") || "Good"}
                      </Button>
                      <Button
                        size="sm"
                        className={`text-xs flex-1 ${
                          itemVerification?.condition === "damaged"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100"
                        }`}
                        onPress={() => handleItemCondition(item.id, "damaged")}
                      >
                        {t("delivery.condition.damaged") || "Damaged"}
                      </Button>
                      <Button
                        size="sm"
                        className={`text-xs flex-1 ${
                          itemVerification?.condition === "missing"
                            ? "bg-red-500 text-white"
                            : "bg-gray-100"
                        }`}
                        onPress={() => handleItemCondition(item.id, "missing")}
                      >
                        {t("delivery.condition.missing") || "Missing"}
                      </Button>
                    </div>

                    {/* Discrepancy Details */}
                    {(itemVerification?.condition === "damaged" ||
                      itemVerification?.condition === "missing") && (
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <p className="text-xs font-semibold">
                          {t("delivery.reportDiscrepancy") ||
                            "Report Discrepancy"}
                        </p>

                        {/* Existing Discrepancies */}
                        {discrepancies
                          .filter((d) => d.item_id === item.id)
                          .map((discrepancy, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-2 rounded border border-gray-200 space-y-2"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <p className="text-xs font-medium">
                                    {discrepancy.type === "missing" &&
                                      (t("delivery.discrepancy.missing") ||
                                        "Missing Items")}
                                    {discrepancy.type === "damaged" &&
                                      (t("delivery.discrepancy.damaged") ||
                                        "Damaged Items")}
                                    {discrepancy.type === "wrong_qty" &&
                                      (t("delivery.discrepancy.wrongQty") ||
                                        "Wrong Quantity")}
                                    {discrepancy.type === "wrong_item" &&
                                      (t("delivery.discrepancy.wrongItem") ||
                                        "Wrong Item")}
                                  </p>
                                </div>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  onPress={() => removeDiscrepancy(idx)}
                                >
                                  ✕
                                </Button>
                              </div>

                              {(discrepancy.type === "wrong_qty" ||
                                discrepancy.type === "missing") && (
                                <div className="flex gap-2 text-xs">
                                  <div className="flex-1">
                                    <p className="text-gray-600 mb-1">
                                      {t("delivery.expected") || "Expected"}
                                    </p>
                                    <Input
                                      type="number"
                                      size="sm"
                                      value={
                                        discrepancy.expected_qty?.toString() ||
                                        ""
                                      }
                                      onValueChange={(val) =>
                                        updateDiscrepancy(
                                          idx,
                                          "expected_qty",
                                          parseInt(val) || 0
                                        )
                                      }
                                      min="0"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-gray-600 mb-1">
                                      {t("delivery.actual") || "Actual"}
                                    </p>
                                    <Input
                                      type="number"
                                      size="sm"
                                      value={
                                        discrepancy.actual_qty?.toString() || ""
                                      }
                                      onValueChange={(val) =>
                                        updateDiscrepancy(
                                          idx,
                                          "actual_qty",
                                          parseInt(val) || 0
                                        )
                                      }
                                      min="0"
                                    />
                                  </div>
                                </div>
                              )}

                              <Textarea
                                size="sm"
                                placeholder={
                                  t("delivery.notes") || "Additional notes..."
                                }
                                value={discrepancy.notes || ""}
                                onValueChange={(val) =>
                                  updateDiscrepancy(idx, "notes", val)
                                }
                                minRows={2}
                              />
                            </div>
                          ))}

                        {/* Add Discrepancy Button */}
                        {discrepancies.filter((d) => d.item_id === item.id)
                          .length === 0 && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              className="text-xs"
                              onPress={() =>
                                addDiscrepancy(
                                  item.id,
                                  itemVerification?.condition === "missing"
                                    ? "missing"
                                    : "damaged"
                                )
                              }
                            >
                              + {t("delivery.addDetails") || "Add Details"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          {verifiedItems.length > 0 && (
            <Card className="bg-blue-50 border border-blue-200">
              <CardBody className="p-3 space-y-1">
                <p className="text-sm font-semibold">
                  {t("delivery.verificationSummary") || "Verification Summary"}
                </p>
                <p className="text-xs text-gray-700">
                  {t("delivery.itemsVerified") || "Items Verified"}:{" "}
                  {verifiedItems.length}/{orderItems.length}
                </p>
                <p className="text-xs text-gray-700">
                  {t("delivery.discrepanciesFound") || "Discrepancies Found"}:{" "}
                  {discrepancies.length}
                </p>
              </CardBody>
            </Card>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={handleClose}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            color="success"
            onPress={handleSubmit}
            isDisabled={isLoading || !allItemsVerified()}
            startContent={isLoading ? <Spinner size="sm" color="current" /> : null}
          >
            {isLoading
              ? t("common.submitting") || "Submitting..."
              : t("delivery.completeVerification") || "Complete Verification"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelfPickupVerificationModal;
