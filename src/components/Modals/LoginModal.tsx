import { useState, FormEvent, useCallback, useRef, FC, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Divider,
  useDisclosure,
  Link,
  Form,
  ModalFooter,
  Tabs,
  Tab,
  InputOtp,
  addToast,
} from "@heroui/react";
import {
  LogIn,
  TruckElectric,
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  Phone,
  Sprout,
  Lock,
} from "lucide-react";
import { MyButton } from "../custom/MyButton";
import RegisterModal from "./RegisterModal";
import GoogleLoginBtn from "../Functional/GoogleLoginBtn";
import {
  checkEmailExists,
  checkPhoneExists,
  handleLoginUser,
  handleSignUp,
  handleResendOtp,
} from "@/helpers/auth";
import { phoneLogin } from "@/routes/api";
import { setCookie } from "@/lib/cookies";
import { login as ReduxLogin } from "@/lib/redux/slices/authSlice";
import {
  updateCartData,
  updateDataOnAuth,
  syncOfflineCartToServer,
} from "@/helpers/updators";
import {
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  trackLogin,
} from "@/lib/analytics";
import { useDispatch } from "react-redux";
import {
  looksLikeEmail,
  looksLikeMobile,
  validateEmail,
  validateMobile,
  validatePassword,
} from "@/helpers/validator";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import { demoEmail, demoNumber, demoPassword } from "@/config/constants";
import dynamic from "next/dynamic";
import { clearRecaptchaVerifier, FirebaseInstance } from "@/lib/firebase";
import { ConfirmationResult } from "firebase/auth";
import { sellerRegister } from "@/routes/api";

const PhoneInput = dynamic(() => import("@/components/Functional/PhoneInput"), {
  ssr: false,
});

type ValidationErrors = {
  email?: string;
  mobile?: string;
  password?: string;
  phone?: string;
  [key: string]: string | undefined;
};
interface LoginModalProps {
  triggerView?: "btn" | "link" | "icon";
}
type LoginMode = "email" | "mobile" | "otp";
type OtpStep = "phone" | "verify";

export const LoginModal: FC<LoginModalProps> = ({ triggerView = "btn" }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const { authSettings, demoMode } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [emailValue, setEmailValue] = useState(demoMode ? demoEmail : "");
  const [mobileValue, setMobileValue] = useState(demoMode ? demoNumber : "");
  const [passwordValue, setPasswordValue] = useState(
    demoMode ? demoPassword : "",
  );

  const [loginMode, setLoginMode] = useState<LoginMode>("mobile");
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(true);
  const [isMobileReadOnly, setIsMobileReadOnly] = useState(true);

  // User type toggle: "customer" or "farmer"
  const [userType, setUserType] = useState<"customer" | "farmer">("customer");

  // Farmer registration states
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showFarmerSuccessModal, setShowFarmerSuccessModal] = useState(false);
  const [farmerFormData, setFarmerFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    password_confirmation: "",
  });
  const [farmerErrors, setFarmerErrors] = useState<{ [key: string]: string }>({});

  // OTP login states
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [otpPhoneNumber, setOtpPhoneNumber] = useState("");
  const [otpNumberDetails, setOtpNumberDetails] = useState({
    countryCode: "",
    phoneNumber: "",
    dialCode: "",
    name: "",
  });

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Debounce hook
  const useDebounce = <T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number,
  ) => {
    const timer = useRef<NodeJS.Timeout | null>(null);
    return useCallback(
      (...args: T) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => callback(...args), delay);
      },
      [callback, delay],
    );
  };

  // Debounced email existence check
  const debouncedEmailCheck = useDebounce(async (email: string) => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: undefined }));
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    try {
      setIsCheckingEmail(true);
      const exists = await checkEmailExists(
        email,
        setIsCheckingEmail,
        () => {},
      );
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          email: t("login_modal.errors.email_not_registered"),
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }, 1000);

  // Handle email input change
  const handleEmailChange = useCallback(
    (value: string) => {
      setEmailValue(value);
      setErrors((prev) => ({ ...prev, email: undefined }));

      if (value && looksLikeMobile(value) && !looksLikeEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address, not a mobile number",
        }));
        return;
      }

      debouncedEmailCheck(value);
    },
    [setEmailValue, setErrors, debouncedEmailCheck], // dependencies
  );

  const debouncedMobileCheck = useDebounce(async (mobile: string) => {
    if (!mobile.trim()) {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
      return;
    }

    // Validation — must be 10 digits
    if (mobile.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        mobile: "Please enter a valid 10-digit mobile number",
      }));
      return;
    }

    try {
      setIsCheckingMobile(true);
      const exists = await checkPhoneExists(
        mobile,
        setIsCheckingMobile,
        () => {},
      );
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          mobile: t("login_modal.errors.mobile_not_registered"),
        }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: undefined }));
      }
    } finally {
      setIsCheckingMobile(false);
    }
  }, 1000);

  // Handle mobile input change
  const handleMobileChange = useCallback(
    (value: string) => {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setMobileValue(digitsOnly);
      setErrors((prev) => ({ ...prev, mobile: undefined }));

      if (value && looksLikeEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          mobile: "Please enter a mobile number, not an email address",
        }));
        return;
      }

      debouncedMobileCheck(digitsOnly);
    },
    [setMobileValue, setErrors, debouncedMobileCheck],
  );

  // Handle OTP phone input change
  const handleOtpPhoneChange = (
    countryCode: string,
    phoneNumber: string,
    dialCode: string,
    name: string,
  ) => {
    const formattedNumber = `${dialCode}${phoneNumber}`;
    setOtpPhoneNumber(formattedNumber);
    setOtpNumberDetails({ countryCode, dialCode, phoneNumber, name });

    // Clear phone error when user is typing
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }

    // Only check if phone number is complete (exactly 10 digits)
    if (phoneNumber && phoneNumber.length === 10) {
      debouncedOtpPhoneCheck(phoneNumber);
    } else if (phoneNumber && phoneNumber.length < 10) {
      // Clear error if user is still typing
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  // Debounced OTP phone check
  const debouncedOtpPhoneCheck = useDebounce(async (phone: string) => {
    if (!phone.trim() || phone.length < 10) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
      return;
    }

    try {
      setIsCheckingMobile(true);
      const exists = await checkPhoneExists(
        phone,
        setIsCheckingMobile,
        () => {},
      );
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          phone: t("login_modal.errors.mobile_not_registered"),
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: undefined }));
      }
    } finally {
      setIsCheckingMobile(false);
    }
  }, 1000);

  // Send OTP for login
  const handleSendOtpForLogin = async () => {
    setIsLoading(true);

    if (!otpPhoneNumber || otpPhoneNumber.length < 10) {
      addToast({
        title: t("login_modal.errors.invalid_phone_title"),
        description: t("login_modal.errors.invalid_phone_desc"),
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    // If there's already an error (number not registered), don't proceed
    if (errors.phone) {
      setIsLoading(false);
      return;
    }

    // Get Firebase instance
    const firebaseInstance = window.firebaseInstance as
      | FirebaseInstance
      | undefined;
    if (!firebaseInstance) {
      addToast({
        title: t("login_modal.errors.firebase_error_title"),
        description: t("login_modal.errors.firebase_error_desc"),
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    // Send OTP
    const success = await handleSignUp(otpPhoneNumber, firebaseInstance);
    if (success) {
      setOtpStep("verify");
    }
    setIsLoading(false);
  };

  // Verify OTP and login
  const handleVerifyOtpAndLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const otp = data.otp as string;

    if (!otp || otp.length !== 6) {
      addToast({
        title: t("login_modal.errors.invalid_otp_title"),
        description: t("login_modal.errors.invalid_otp_desc"),
        color: "danger",
      });
      setIsLoading(false);
      return;
    }

    // Get confirmation result
    const confirmationResult = window.confirmationResult as
      | ConfirmationResult
      | undefined;
    if (!confirmationResult) {
      addToast({
        title: t("login_modal.errors.verification_error_title"),
        description: t("login_modal.errors.verification_error_desc"),
        color: "danger",
      });
      setIsLoading(false);
      setOtpStep("phone");
      return;
    }

    try {
      // Verify OTP with Firebase
      const userCredential = await confirmationResult.confirm(otp);

      // Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      const fcm_token = localStorage.getItem("fcm-token") || undefined;

      console.log(
        "Firebase ID Token obtained:",
        idToken.substring(0, 50) + "...",
      );

      // Call phone login API with Firebase token
      const response = await phoneLogin({
        idToken,
        fcm_token,
        device_type: "web",
      });

      if (response.success && response.data) {
        // Set cookies
        setCookie("user", response.data);
        setCookie("access_token", response.access_token || "");

        // Update Redux store
        dispatch(
          ReduxLogin({
            user: response.data,
            access_token: response.access_token || "",
          }),
        );

        // Sync offline cart items to server
        await syncOfflineCartToServer();

        // Update data and cart
        updateDataOnAuth();
        updateCartData(false, false, 0);

        // Track analytics
        setAnalyticsUserId(response.data.id.toString());
        setAnalyticsUserProperties({
          login_method: "phone_otp",
          user_type: "customer",
        });
        trackLogin("phone_otp");

        // Show success toast
        addToast({
          title: t("login_modal.welcome_title"),
          description: t("login_modal.login_success_toast"),
          color: "success",
        });

        // Reset states and close modal
        setErrors({});
        setOtpPhoneNumber("");
        setOtpStep("phone");
        onOpenChange();
      } else {
        // Handle API error
        addToast({
          title: t("login_modal.errors.verification_failed_title"),
          description: response.message || "Login failed. Please try again.",
          color: "danger",
        });
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to verify OTP";
      console.error("OTP verification error:", errorMsg);
      addToast({
        title: t("login_modal.errors.verification_failed_title"),
        description: errorMsg,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtpForLogin = async () => {
    setIsResendingOtp(true);

    const firebaseInstance = window.firebaseInstance as
      | FirebaseInstance
      | undefined;
    if (!firebaseInstance) {
      addToast({
        title: t("login_modal.errors.firebase_error_title"),
        description: t("login_modal.errors.firebase_error_desc"),
        color: "danger",
      });
      setIsResendingOtp(false);
      return;
    }

    await handleResendOtp(otpPhoneNumber, firebaseInstance);
    setIsResendingOtp(false);
  };

  // Handle tab change - clear errors and values for inactive tab
  const handleTabChange = (key: string | number) => {
    const newMode = key as LoginMode;
    setLoginMode(newMode);
    setErrors({});

    if (newMode === "email") {
      setMobileValue("");
      setIsMobileReadOnly(true); // Reset readonly for inactive tab
      setOtpPhoneNumber("");
      setOtpStep("phone");
    } else if (newMode === "mobile") {
      setEmailValue("");
      setIsEmailReadOnly(true); // Reset readonly for inactive tab
      setOtpPhoneNumber("");
      setOtpStep("phone");
    } else if (newMode === "otp") {
      setEmailValue("");
      setMobileValue("");
      setIsEmailReadOnly(true);
      setIsMobileReadOnly(true);
      setOtpStep("phone");
    }
  };

  // Handle form submission
  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = passwordValue;
    const validationErrors: ValidationErrors = {};

    if (loginMode === "email") {
      const email = formData.get("email") as string;

      if (looksLikeMobile(email) && !looksLikeEmail(email)) {
        validationErrors.email =
          "Please use the Mobile tab to login with a mobile number";
      } else {
        const emailError = validateEmail(email);
        if (emailError) validationErrors.email = emailError;
      }
    } else {
      const mobile = formData.get("mobile") as string;

      if (looksLikeEmail(mobile)) {
        validationErrors.mobile =
          "Please use the Email tab to login with an email address";
      } else {
        const mobileError = validateMobile(mobile);
        if (mobileError) validationErrors.mobile = mobileError;
      }
    }

    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.password = passwordError;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const loginData = {
        email:
          loginMode === "email" ? (formData.get("email") as string) : undefined,
        mobile:
          loginMode === "mobile"
            ? (formData.get("mobile") as string)
            : undefined,
        password,
      };

      await handleLoginUser(loginData, dispatch);

      setErrors({});
      setEmailValue("");
      setMobileValue("");
      onOpenChange();
    } catch (error) {
      console.error("Login failed:", error);
      setErrors((prev) => ({
        ...prev,
        password: "Login failed. Please check your credentials.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Farmer registration handlers
  const handleFarmerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFarmerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (farmerErrors[name]) {
      setFarmerErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateFarmerForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!farmerFormData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!farmerFormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(farmerFormData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!farmerFormData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(farmerFormData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!farmerFormData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (farmerFormData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!farmerFormData.password_confirmation.trim()) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (farmerFormData.password !== farmerFormData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setFarmerErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFarmerSubmit = async () => {
    if (!validateFarmerForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await sellerRegister({
        name: farmerFormData.name,
        email: farmerFormData.email,
        mobile: farmerFormData.mobile,
        password: farmerFormData.password,
        password_confirmation: farmerFormData.password_confirmation,
        // Required backend fields
        verification_status: "approved",
        visibility_status: "visible",
      } as any);

      console.log("Farmer registration response:", response);

      if (response.success) {
        // Reset form
        setFarmerFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          password_confirmation: "",
        });
        setFarmerErrors({});

        // Show success modal instead of just toast
        setShowFarmerSuccessModal(true);
      } else {
        // Handle backend validation errors
        console.error("Registration error response:", response);

        // Check if response contains field errors
        if (response.errors && typeof response.errors === "object") {
          const backendErrors: { [key: string]: string } = {};

          // Map backend field names to form field names
          for (const [key, value] of Object.entries(response.errors)) {
            if (Array.isArray(value)) {
              backendErrors[key] = value[0]; // Get first error message
            } else if (typeof value === "string") {
              backendErrors[key] = value;
            }
          }

          console.error("Mapped backend errors:", backendErrors);
          setFarmerErrors(backendErrors);
        }

        // Show more detailed error message
        const errorDetails = response.errors
          ? Object.entries(response.errors)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.join(", ");
                }
                return value;
              })
              .join("\n")
          : "";

        addToast({
          title: "Registration Failed",
          description: errorDetails || response.message || "Please check the form for errors and try again",
          color: "danger",
          timeout: 7000,
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

  // Reset form when modal closes
  const handleModalClose = () => {
    setErrors({});
    setEmailValue("");
    setMobileValue("");
    setPasswordValue("");
    setShowPassword(false);
    setLoginMode("email");
    setIsEmailReadOnly(true);
    setIsMobileReadOnly(true);

    // Reset farmer form
    setFarmerFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      password_confirmation: "",
    });
    setFarmerErrors({});
    setShowConfirmPassword(false);
    setShowFarmerSuccessModal(false);
    setUserType("customer");

    // Reset OTP states
    setOtpPhoneNumber("");
    setOtpStep("phone");
    setOtpNumberDetails({
      countryCode: "",
      phoneNumber: "",
      dialCode: "",
      name: "",
    });

    // Cleanup Firebase
    if (window.confirmationResult) {
      window.confirmationResult = undefined;
    }
    if (window.firebaseInstance) {
      clearRecaptchaVerifier(window.firebaseInstance);
    }

    // Force clear all inputs
    if (emailInputRef.current) emailInputRef.current.value = "";
    if (mobileInputRef.current) mobileInputRef.current.value = "";
  };

  useEffect(() => {
    if (isOpen && demoMode) {
      setMobileValue(demoNumber);
      setEmailValue(demoEmail);
      setPasswordValue(demoPassword);
    }
  }, [isOpen, loginMode, demoMode]);
  return (
    <>
      {/* Trigger Button */}
      {triggerView === "btn" ? (
        <MyButton
          id="login-btn"
          color="primary"
          onPress={onOpen}
          startContent={<LogIn size={16} />}
          size="responsive"
          variant="flat"
          className="p-0 text-xs"
        >
          {t("login_modal.button")}
        </MyButton>
      ) : triggerView === "icon" ? (
        <Button
          id="login-btn"
          size="sm"
          onPress={onOpen}
          isIconOnly
          className="p-0 rounded-full bg-transparent text-foreground/50 hover:text-foreground/70"
        >
          <User size={20} />
        </Button>
      ) : (
        <div
          className="text-primary-600 text-md underline cursor-pointer"
          onClick={onOpen}
          id="login-btn"
        >
          {t("login_modal.button")}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) handleModalClose();
          onOpenChange();
        }}
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
        size="md"
        classNames={{
          base: "rounded-lg",
          header: "border-b border-divider",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TruckElectric className="text-primary" size={24} />
                    <h2 className="font-semibold">
                      {userType === "customer"
                        ? t("login_modal.welcome_title")
                        : "🌾 Become a Farmer"}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-default-500">
                  {userType === "customer"
                    ? t("login_modal.welcome_subtitle")
                    : "Join our farming community and grow your business"}
                </p>

                {/* User Type Toggle */}
                <div className="flex gap-2 w-full mt-2">
                  <Button
                    size="md"
                    variant={userType === "customer" ? "solid" : "bordered"}
                    color={userType === "customer" ? "primary" : "default"}
                    className="flex-1 text-base font-semibold"
                    onPress={() => setUserType("customer")}
                    startContent={<User size={18} />}
                  >
                    Customer
                  </Button>
                  <Button
                    size="md"
                    variant={userType === "farmer" ? "solid" : "bordered"}
                    color={userType === "farmer" ? "success" : "default"}
                    className="flex-1 text-base font-semibold"
                    onPress={() => setUserType("farmer")}
                  >
                    🌾 Farmer
                  </Button>
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                {userType === "customer" ? (
                  <>
                    {/* Tabs - Always visible for customer */}
                    <div className="w-full flex justify-center mb-6">
                      <Tabs
                    selectedKey={loginMode}
                    onSelectionChange={handleTabChange}
                    classNames={{
                      cursor: "w-full bg-primary",
                      tab: "max-w-fit",
                      tabContent:
                        "group-data-[selected=true]:text-primary-foreground",
                    }}
                  >
                    <Tab
                      key="mobile"
                      title={
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} />
                          <span>{t("login_modal.mobile_tab")}</span>
                        </div>
                      }
                    />
                    <Tab
                      key="email"
                      title={
                        <div className="flex items-center gap-2">
                          <Mail size={16} />
                          <span>{t("login_modal.email_tab")}</span>
                        </div>
                      }
                    />
                    <Tab
                      key="otp"
                      title={
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{t("login_modal.otp_tab")}</span>
                        </div>
                      }
                    />
                  </Tabs>
                </div>

                {loginMode === "otp" ? (
                  // OTP Login Flow
                  otpStep === "phone" ? (
                    <Form
                      className="w-full space-y-6"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendOtpForLogin();
                      }}
                      autoComplete="off"
                    >
                      <div className="flex flex-col gap-6 w-full">
                        <PhoneInput
                          defaultCountry={demoMode ? "in" : undefined}
                          defaultValue={demoMode ? demoNumber : undefined}
                          onPhoneChange={handleOtpPhoneChange}
                          className="w-full"
                          label={t("login_modal.phone_label")}
                          placeholder={t("login_modal.phone_placeholder")}
                        />
                        {(errors.phone || isCheckingMobile) && (
                          <div className="mt-1 text-xs text-danger flex items-center gap-2">
                            {isCheckingMobile && (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-danger"></div>
                            )}
                            {errors.phone}
                          </div>
                        )}
                      </div>

                      <Button
                        color="primary"
                        className="w-full font-medium"
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={
                          !otpPhoneNumber || isCheckingMobile || !!errors.phone
                        }
                      >
                        {t("login_modal.send_otp")}
                      </Button>
                    </Form>
                  ) : (
                    // OTP Verification Step
                    <Form
                      className="w-full space-y-6"
                      onSubmit={handleVerifyOtpAndLogin}
                      autoComplete="off"
                    >
                      <div className="flex flex-col gap-6 w-full items-center">
                        <InputOtp
                          isRequired
                          length={6}
                          placeholder={t("login_modal.otp_placeholder")}
                          variant="flat"
                          name="otp"
                          color="primary"
                          size="lg"
                          radius="md"
                          classNames={{
                            wrapper: "flex gap-2 justify-center",
                            errorMessage: "sm:text-xs text-center",
                          }}
                        />
                        <div className="text-center">
                          <p className="text-sm text-default-500 mb-2">
                            {t("login_modal.did_not_receive_code")}
                          </p>
                          <Button
                            variant="light"
                            color="primary"
                            size="sm"
                            type="button"
                            onPress={handleResendOtpForLogin}
                            isLoading={isResendingOtp}
                            isDisabled={isLoading}
                            className="text-sm"
                          >
                            {t("login_modal.resend_code")}
                          </Button>
                        </div>
                      </div>
                      <Button
                        color="primary"
                        className="w-full font-medium"
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={isResendingOtp}
                      >
                        {t("login_modal.verify_and_login")}
                      </Button>
                      <Button
                        variant="light"
                        className="w-full"
                        onPress={() => {
                          if (window.firebaseInstance) {
                            clearRecaptchaVerifier(window.firebaseInstance);
                          }
                          if (window.confirmationResult) {
                            window.confirmationResult = undefined;
                          }
                          setOtpStep("phone");
                        }}
                        isDisabled={isLoading}
                      >
                        {t("login_modal.back_to_phone")}
                      </Button>
                    </Form>
                  )
                ) : (
                  // Email/Mobile with Password Login
                  <Form
                    ref={formRef}
                    className="w-full space-y-6"
                    onSubmit={handleLoginSubmit}
                    autoComplete="off"
                  >
                    {/* Input Fields */}
                    <div className="flex flex-col gap-6 w-full">
                      {loginMode === "email" ? (
                        <Input
                          ref={emailInputRef}
                          key="email-input" // Force remount on tab change
                          isRequired
                          autoComplete="email"
                          label={t("login_modal.email_label")}
                          labelPlacement="outside"
                          placeholder={t("login_modal.email_placeholder")}
                          name="email"
                          type="email"
                          value={emailValue}
                          isInvalid={!!errors.email}
                          errorMessage={errors.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          isReadOnly={isEmailReadOnly}
                          onFocus={() => setIsEmailReadOnly(false)}
                          classNames={{ errorMessage: "text-xs" }}
                          endContent={
                            isCheckingEmail ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            ) : (
                              <Mail size={18} className="text-default-400" />
                            )
                          }
                        />
                      ) : (
                        <Input
                          ref={mobileInputRef}
                          key="mobile-input" // Force remount on tab change
                          isRequired
                          autoComplete="tel"
                          label={t("login_modal.mobile_label")}
                          labelPlacement="outside"
                          placeholder={t("login_modal.mobile_placeholder")}
                          name="mobile"
                          type="tel"
                          value={mobileValue}
                          onChange={(e) => handleMobileChange(e.target.value)}
                          isReadOnly={isMobileReadOnly}
                          onFocus={() => setIsMobileReadOnly(false)}
                          isInvalid={!!errors.mobile}
                          errorMessage={errors.mobile}
                          classNames={{ errorMessage: "text-xs" }}
                          maxLength={10}
                          endContent={
                            isCheckingMobile ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            ) : (
                              <Phone size={18} className="text-default-400" />
                            )
                          }
                        />
                      )}

                      <Input
                        key={`password-${loginMode}`}
                        isRequired
                        autoComplete="current-password"
                        label={t("login_modal.password_label")}
                        labelPlacement="outside"
                        placeholder={t("login_modal.password_placeholder")}
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        errorMessage={errors.password}
                        classNames={{ errorMessage: "text-xs" }}
                        endContent={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff size={18} className="text-default-400" />
                            ) : (
                              <Eye size={18} className="text-default-400" />
                            )}
                          </button>
                        }
                      />

                      <div className="flex justify-end w-full items-center">
                        <Link color="primary" href="/forgot-password" size="sm">
                          {t("login_modal.forgot_password")}
                        </Link>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      color="primary"
                      className="w-full font-medium"
                      type="submit"
                      isLoading={isLoading}
                      isDisabled={isCheckingEmail || isCheckingMobile}
                    >
                      {t("login_modal.sign_in")}
                    </Button>
                  </Form>
                )}

                    {/* Social Login */}
                    {authSettings?.googleLogin && (
                      <>
                        <div className="flex items-center gap-4 mt-6">
                          <Divider className="flex-1" />
                          <span className="text-default-500 text-sm">
                            {t("login_modal.or")}
                          </span>
                          <Divider className="flex-1" />
                        </div>

                        <div className="flex flex-col gap-3">
                          <GoogleLoginBtn
                            isLoading={isLoading}
                            onOpenChange={onOpenChange}
                            setIsLoading={setIsLoading}
                            context="login"
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  // Farmer Registration Form
                  <div className="space-y-4 w-full">
                    {/* Error Banner */}
                    {Object.keys(farmerErrors).length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-700 mb-2">
                          Please fix the following errors:
                        </p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {Object.entries(farmerErrors).map(([_key, error]) => (
                            <li key={_key} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Name */}
                    <Input
                      name="name"
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={farmerFormData.name}
                      onChange={handleFarmerChange}
                      isInvalid={!!farmerErrors.name}
                      errorMessage={farmerErrors.name}
                      startContent={<User className="text-default-400 w-4 h-4" />}
                    />

                    {/* Email */}
                    <Input
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      value={farmerFormData.email}
                      onChange={handleFarmerChange}
                      isInvalid={!!farmerErrors.email}
                      errorMessage={farmerErrors.email}
                      startContent={<Mail className="text-default-400 w-4 h-4" />}
                    />

                    {/* Mobile */}
                    <Input
                      name="mobile"
                      label="Mobile Number"
                      placeholder="10-digit mobile number"
                      value={farmerFormData.mobile}
                      onChange={handleFarmerChange}
                      isInvalid={!!farmerErrors.mobile}
                      errorMessage={farmerErrors.mobile}
                      startContent={<Smartphone className="text-default-400 w-4 h-4" />}
                    />

                    {/* Password */}
                    <Input
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password (min. 6 characters)"
                      value={farmerFormData.password}
                      onChange={handleFarmerChange}
                      isInvalid={!!farmerErrors.password}
                      errorMessage={farmerErrors.password}
                      startContent={<Lock className="text-default-400 w-4 h-4" />}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="text-default-400 w-4 h-4" />
                          ) : (
                            <Eye className="text-default-400 w-4 h-4" />
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
                      value={farmerFormData.password_confirmation}
                      onChange={handleFarmerChange}
                      isInvalid={!!farmerErrors.password_confirmation}
                      errorMessage={farmerErrors.password_confirmation}
                      startContent={<Lock className="text-default-400 w-4 h-4" />}
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="text-default-400 w-4 h-4" />
                          ) : (
                            <Eye className="text-default-400 w-4 h-4" />
                          )}
                        </button>
                      }
                    />

                    {/* Submit Button */}
                    <Button
                      color="success"
                      className="w-full font-medium mt-6"
                      onPress={handleFarmerSubmit}
                      isLoading={isLoading}
                    >
                      Become a Farmer
                    </Button>
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="flex items-center justify-center gap-2">
                {userType === "customer" ? (
                  <>
                    <p className="text-center text-sm text-default-500">
                      {t("login_modal.no_account")}
                    </p>
                    <Link
                      color="primary"
                      size="sm"
                      onClick={() => {
                        document.getElementById("register-btn")?.click();
                        handleModalClose();
                        onClose();
                      }}
                      className="cursor-pointer"
                    >
                      {t("login_modal.create_account")}
                    </Link>
                  </>
                ) : (
                  <p className="text-center text-sm text-default-500">
                    Already have a farmer account?{" "}
                    <Link
                      color="primary"
                      size="sm"
                      onClick={() => setUserType("customer")}
                      className="cursor-pointer"
                    >
                      Switch to Customer Login
                    </Link>
                  </p>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Farmer Registration Success Modal */}
      <Modal
        isOpen={showFarmerSuccessModal}
        onOpenChange={setShowFarmerSuccessModal}
        backdrop="blur"
        size="sm"
        classNames={{
          base: "rounded-lg",
          header: "border-b border-divider",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          {(onSuccessClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Sprout className="text-success" size={24} />
                  <h2 className="font-semibold text-success">
                    Registration Successful! 🎉
                  </h2>
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                    <p className="text-success-900 font-semibold mb-2">
                      Welcome to FarmersMart! 🌾
                    </p>
                    <p className="text-success-800 text-sm">
                      Your farmer account has been created successfully. A verification email has been sent to your registered email address.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 font-semibold mb-2">
                      Next Steps:
                    </p>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Check your email for a verification link</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Verify your account to activate your seller dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Log in to the seller dashboard to start listing products</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-default-500 text-sm text-center">
                    📧 Check your email: <span className="font-semibold">{farmerFormData.email}</span>
                  </p>
                </div>
              </ModalBody>

              <ModalFooter className="flex gap-2">
                <Button
                  variant="light"
                  onPress={() => {
                    setShowFarmerSuccessModal(false);
                    onSuccessClose();
                  }}
                >
                  Continue Shopping
                </Button>
                <Button
                  color="success"
                  onPress={() => {
                    window.open("https://backend.farmersmart.ng/seller", "_blank");
                    setShowFarmerSuccessModal(false);
                    onSuccessClose();
                    handleModalClose();
                  }}
                  startContent={<Sprout size={16} />}
                >
                  Go to Seller Dashboard
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <RegisterModal />
    </>
  );
};

export default LoginModal;
