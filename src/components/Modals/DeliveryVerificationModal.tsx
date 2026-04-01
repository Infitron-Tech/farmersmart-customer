import React, { FC, useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Select,
  SelectItem,
  addToast,
  Spinner,
} from "@heroui/react";
import { Camera, Lock, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { completeDeliveryVerification, initiateDeliveryVerification } from "@/routes/api";

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
  const [step, setStep] = useState<'phone' | 'otp' | 'photos' | 'items'>(
    'phone'
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [itemConditions, setItemConditions] = useState<{
    [key: number]: 'good' | 'damaged' | 'missing' | '';
  }>({});
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);


  // Initiate delivery verification and send OTP via Termii
  const handlePhoneSignUp = async () => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description: t("delivery.phoneRequired") || "Please enter your phone number",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await initiateDeliveryVerification(orderId);

      if (result.success) {
        setStep("otp");
        addToast({
          title: t("delivery.verification.otpSent.title") || "OTP Sent",
          description:
            t("delivery.verification.otpSent.description") ||
            "An OTP has been sent to your phone",
          color: "success",
        });
      } else {
        addToast({
          title: t("delivery.verification.otpError.title") || "Error",
          description:
            result.message || t("delivery.verification.otpError.description") ||
            "Failed to send OTP",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error initiating verification:", error);
      addToast({
        title: t("general.error.title") || "Error",
        description: t("general.error.somethingWentWrong") || "Something went wrong",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP format and proceed to photos
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description:
          t("delivery.otpValidation.description") ||
          "OTP must be exactly 6 digits",
        color: "danger",
      });
      return;
    }

    // OTP format is valid, move to photos step
    setStep("photos");
    addToast({
      title: t("delivery.verification.phoneVerified") || "OTP Verified",
      description:
        t("delivery.verification.phoneVerifiedDesc") ||
        "OTP verified. Please upload delivery photos.",
      color: "success",
    });
  };

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

  const handleNextStep = () => {
    if (step === 'photos') {
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
      setStep('items');
    }
  };

  const handleSubmit = async () => {
    // Validate all items have a condition selected
    const allItemsVerified = orderItems.every((item) => itemConditions[item.id]);
    if (!allItemsVerified) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description:
          t("delivery.verifyAllItems") ||
          "Please verify the condition of all items",
        color: "danger",
      });
      return;
    }

    if (!phoneConfirmed) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description: "Please confirm that you received the OTP on your phone",
        color: "danger",
      });
      return;
    }

    if (!otp || otp.length !== 6) {
      addToast({
        title: t("validation.error") || "Validation Error",
        description: "OTP is required",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const verifiedItemsArray = orderItems.map((item) => ({
        item_id: item.id,
        condition: itemConditions[item.id],
      }));

      const result = await completeDeliveryVerification({
        order_id: orderId,
        delivery_photos: uploadedPhotos.map((p) => p.file),
        otp,
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
    setStep("phone");
    setUploadedPhotos([]);
    setPhoneNumber("");
    setOtp("");
    setPhoneConfirmed(false);
    setItemConditions({});
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
          {/* Step 1: Phone Number Entry */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  {t("delivery.phoneRequired") ||
                    "Enter your phone number to receive OTP verification"}
                </p>
              </div>

              <Input
                type="tel"
                label={t("delivery.phoneNumber") || "Phone Number"}
                placeholder={t("delivery.phonePlaceholder") || "706 8839674 or 0706 8839674"}
                value={phoneNumber}
                onValueChange={setPhoneNumber}
                description={t("delivery.phoneNumberHelp") || "Enter 10 digits (with or without leading 0)"}
                startContent={<Phone className="w-4 h-4 text-default-400" />}
              />

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-700">
                  {t("delivery.verification.phoneHelp") ||
                    "We'll send you an OTP to verify your phone number"}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: OTP Entry */}
          {step === 'otp' && (
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
                    "OTP expires in 10 minutes."}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Upload Photos */}
          {step === 'photos' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  {t("delivery.verification.step1.description") ||
                    "Please upload photos of the delivered items (1-5 photos required)"}
                </p>
              </div>

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

          {/* Step 4: Verify Items */}
          {step === 'items' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  {t("delivery.verification.step3.description") ||
                    "Confirm phone number and verify delivered items"}
                </p>
              </div>

              {/* Phone Confirmation */}
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={phoneConfirmed}
                  onValueChange={setPhoneConfirmed}
                />
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {t("delivery.confirmPhone") ||
                      "I confirm that I have received a verification code on my phone"}
                  </span>
                </div>
              </div>

              {/* Verify Items */}
              <div className="border rounded-lg p-3">
                <p className="text-sm font-semibold mb-3">
                  {t("delivery.verifyItems") || "Verify Received Items"}
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <Select
                        label={t("delivery.condition.label") || "Condition"}
                        placeholder={t("delivery.condition.select") || "Select condition"}
                        selectedKeys={itemConditions[item.id] ? [itemConditions[item.id]] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          setItemConditions((prev) => ({
                            ...prev,
                            [item.id]: selectedKey as 'good' | 'damaged' | 'missing',
                          }));
                        }}
                        className="w-32"
                        size="sm"
                      >
                        <SelectItem key="good" value="good">
                          {t("delivery.condition.good") || "Good"}
                        </SelectItem>
                        <SelectItem key="damaged" value="damaged">
                          {t("delivery.condition.damaged") || "Damaged"}
                        </SelectItem>
                        <SelectItem key="missing" value="missing">
                          {t("delivery.condition.missing") || "Missing"}
                        </SelectItem>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={handleClose} isDisabled={isLoading}>
            {t("common.cancel") || "Cancel"}
          </Button>

          {step === 'phone' && (
            <Button
              color="primary"
              onPress={handlePhoneSignUp}
              isDisabled={isLoading || !phoneNumber}
              startContent={isLoading ? <Spinner size="sm" color="current" /> : null}
            >
              {isLoading ? t("common.loading") || "Loading..." : t("common.sendOtp") || "Send OTP"}
            </Button>
          )}

          {step === 'otp' && (
            <Button
              color="primary"
              onPress={handleVerifyOtp}
              isDisabled={isLoading || otp.length !== 6}
              startContent={isLoading ? <Spinner size="sm" color="current" /> : null}
            >
              {isLoading ? t("common.verifying") || "Verifying..." : t("common.verify") || "Verify OTP"}
            </Button>
          )}

          {step === 'photos' && (
            <Button
              color="primary"
              onPress={handleNextStep}
              isDisabled={isLoading || uploadedPhotos.length === 0}
            >
              {t("common.next") || "Next"}
            </Button>
          )}

          {step === 'items' && (
            <Button
              color="success"
              onPress={handleSubmit}
              isDisabled={isLoading}
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
