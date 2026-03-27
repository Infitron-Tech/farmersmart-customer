import React, { FC, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  addToast,
  Spinner,
} from "@heroui/react";
import { Camera, Lock, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { completeDeliveryVerification } from "@/routes/api";

interface DeliveryVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderItems: any[];
  onSuccess?: () => void;
}

interface UploadedPhoto {
  file: File;
  preview: string;
}

const DeliveryVerificationModal: FC<DeliveryVerificationModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  orderItems,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Photos, 2: OTP, 3: Phone Confirmation
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [otp, setOtp] = useState("");
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState<{ [key: number]: boolean }>({});

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Limit to 5 photos
    if (uploadedPhotos.length + files.length > 5) {
      addToast({
        title: t("delivery.photoLimitError.title") || "Photo Limit",
        description:
          t("delivery.photoLimitError.description") ||
          "You can upload a maximum of 5 photos",
        color: "warning",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedPhotos((prev) => [
            ...prev,
            {
              file,
              preview: e.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (uploadedPhotos.length < 1 || uploadedPhotos.length > 5) {
        addToast({
          title: t("validation.error") || "Validation Error",
          description:
            t("delivery.photoValidation.description") ||
            "Please upload between 1 and 5 photos",
          color: "danger",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        addToast({
          title: t("validation.error") || "Validation Error",
          description:
            t("delivery.otpValidation.description") ||
            "OTP must be exactly 6 digits",
          color: "danger",
        });
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!phoneConfirmed) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description:
          t("delivery.phoneConfirmation.description") ||
          "Please confirm your phone number",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const verifiedItemsArray = orderItems
        .filter((item) => verifiedItems[item.id])
        .map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
        }));

      const result = await completeDeliveryVerification({
        order_id: orderId,
        delivery_photos: uploadedPhotos.map((p) => p.file),
        otp,
        phone_confirmed: phoneConfirmed,
        verified_items: verifiedItemsArray,
      });

      if (result.success) {
        addToast({
          title: t("delivery.verification.success.title") || "Success",
          description:
            t("delivery.verification.success.description") ||
            "Delivery verification completed successfully",
          color: "success",
        });
        onOpenChange(false);
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
    setStep(1);
    setUploadedPhotos([]);
    setOtp("");
    setPhoneConfirmed(false);
    setVerifiedItems({});
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
          {t("delivery.verification.title") || "Complete Delivery Verification"}
        </ModalHeader>
        <ModalBody>
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  {t("delivery.verification.step1.description") ||
                    "Please upload photos of the delivered items (1-5 photos required)"}
                </p>
              </div>

              {/* Uploaded Photos Preview */}
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-center mt-1">
                        {index + 1}/5
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">
                    {t("delivery.uploadPhotos") || "Click to upload photos"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {uploadedPhotos.length}/5 {t("delivery.photosUploaded") || "photos uploaded"}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadedPhotos.length >= 5}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  {t("delivery.verification.step2.description") ||
                    "Enter the 6-digit OTP sent to your phone"}
                </p>
              </div>

              <Input
                type="text"
                label={t("delivery.otp") || "OTP"}
                placeholder="000000"
                value={otp}
                onValueChange={setOtp}
                maxLength={6}
                startContent={<Lock className="w-4 h-4 text-default-400" />}
                className="font-mono text-center text-lg"
              />

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  {t("delivery.otpExpiryWarning") ||
                    "OTP expires in 10 minutes. Maximum 3 attempts allowed."}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  {t("delivery.verification.step3.description") ||
                    "Confirm phone number and verify delivered items"}
                </p>
              </div>

              {/* Phone Confirmation */}
              <Checkbox
                isSelected={phoneConfirmed}
                onValueChange={setPhoneConfirmed}
                startContent={<Phone className="w-4 h-4" />}
              >
                <span className="text-sm">
                  {t("delivery.confirmPhone") ||
                    "I confirm that I have received a verification code on my phone"}
                </span>
              </Checkbox>

              {/* Verify Items */}
              <div className="border rounded-lg p-3">
                <p className="text-sm font-semibold mb-3">
                  {t("delivery.verifyItems") || "Verify Received Items"}
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderItems.map((item) => (
                    <Checkbox
                      key={item.id}
                      isSelected={verifiedItems[item.id] || false}
                      onValueChange={(checked) =>
                        setVerifiedItems((prev) => ({
                          ...prev,
                          [item.id]: checked,
                        }))
                      }
                    >
                      <span className="text-sm">
                        {item.product.name} × {item.quantity}
                      </span>
                    </Checkbox>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={handleClose}>
            {t("common.cancel") || "Cancel"}
          </Button>
          {step < 3 && (
            <Button
              color="primary"
              onPress={handleNext}
              isDisabled={isLoading}
            >
              {t("common.next") || "Next"}
            </Button>
          )}
          {step === 3 && (
            <Button
              color="success"
              onPress={handleSubmit}
              isDisabled={isLoading || !phoneConfirmed}
              startContent={isLoading ? <Spinner size="sm" color="current" /> : null}
            >
              {isLoading
                ? t("common.submitting") || "Submitting..."
                : t("delivery.verification.submit") || "Complete Verification"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeliveryVerificationModal;
