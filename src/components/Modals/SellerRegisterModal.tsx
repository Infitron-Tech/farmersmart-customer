import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { useState, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { sellerRegister } from "@/routes/api";
import { useTranslation } from "react-i18next";

interface SellerRegisterModalProps {
  trigger?: ReactNode;
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
}

export default function SellerRegisterModal({
  trigger,
}: SellerRegisterModalProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.password_confirmation.trim()) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await sellerRegister({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      } as any);

      if (response.success) {
        addToast({
          title: "Success!",
          description:
            "Registration successful. Please check your email to verify your account.",
          color: "success",
          timeout: 5000,
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          password_confirmation: "",
        });
        setErrors({});

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        addToast({
          title: "Registration Failed",
          description: response.message || "An error occurred during registration",
          color: "danger",
          timeout: 5000,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      addToast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={onOpen}>{trigger}</div>
      ) : (
        <Button
          color="primary"
          onPress={onOpen}
          className="font-semibold"
        >
          Become a Farmer
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="md"
        className="dark:bg-slate-900"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-green-600">
                  🌾 Become a Farmer
                </h2>
                <p className="text-sm font-normal text-slate-500">
                  Join our farming community and grow your business
                </p>
              </ModalHeader>

              <ModalBody className="gap-4">
                <div className="space-y-4">
                  {/* Name */}
                  <Input
                    name="name"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    startContent={<span className="text-slate-400">👤</span>}
                  />

                  {/* Email */}
                  <Input
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    startContent={<span className="text-slate-400">📧</span>}
                  />

                  {/* Mobile */}
                  <Input
                    name="mobile"
                    label="Mobile Number"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    isInvalid={!!errors.mobile}
                    errorMessage={errors.mobile}
                    startContent={<span className="text-slate-400">📱</span>}
                  />

                  {/* Password */}
                  <Input
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                    startContent={<span className="text-slate-400">🔒</span>}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Eye className="text-slate-400 w-4 h-4" />
                        ) : (
                          <EyeOff className="text-slate-400 w-4 h-4" />
                        )}
                      </button>
                    }
                  />

                  {/* Confirm Password */}
                  <Input
                    name="password_confirmation"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    isInvalid={!!errors.password_confirmation}
                    errorMessage={errors.password_confirmation}
                    startContent={<span className="text-slate-400">🔒</span>}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye className="text-slate-400 w-4 h-4" />
                        ) : (
                          <EyeOff className="text-slate-400 w-4 h-4" />
                        )}
                      </button>
                    }
                  />

                  <p className="text-xs text-slate-500 mt-2">
                    By registering, you agree to our Terms & Conditions and
                    Privacy Policy
                  </p>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  className="font-semibold"
                >
                  Register as Farmer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
