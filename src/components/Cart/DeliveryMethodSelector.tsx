import { FC, useEffect, useState } from "react";
import { Card, CardBody, Radio, RadioGroup, Skeleton, addToast } from "@heroui/react";
import { Truck, MapPin, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setDeliveryMethod, setDeliveryFee } from "@/lib/redux/slices/checkoutSlice";
import { getAvailableDeliveryMethods, calculateDeliveryFee } from "@/routes/api";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import { updateCartData } from "@/helpers/updators";

interface DeliveryOption {
  id: string;
  code: string;
  name: string;
  description: string;
  fee: number;
  icon: React.ReactNode;
  badge?: string;
}

const DeliveryMethodSelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currencySymbol } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const selectedAddress = useSelector(
    (state: RootState) => state.checkout.selectedAddress
  );
  const cartDeliveryMethod = useSelector(
    (state: RootState) => state.checkout.deliveryMethod
  );

  const cartData = useSelector(
    (state: RootState) => state.cart.cartData
  );

  // Fetch available delivery methods when address is selected
  useEffect(() => {
    if (!selectedAddress?.id || !cartData?.id) {
      setDeliveryOptions([]);
      return;
    }

    const fetchDeliveryMethods = async () => {
      setIsLoading(true);
      try {
        const result = await getAvailableDeliveryMethods(
          cartData.id,
          selectedAddress?.latitude,
          selectedAddress?.longitude
        );

        if (result.success && result.data?.methods) {
          const options: DeliveryOption[] = result.data.methods.map(
            (method: any) => ({
              id: method.id || method.key,
              code: method.code || method.id,
              name: method.name,
              description: method.description,
              fee: method.fee || 0,
              icon: getIconForMethod(method.code || method.id),
              badge: method.badge,
            })
          );
          setDeliveryOptions(options);

          // Set first option as default if none selected
          if (!selectedMethod && options.length > 0) {
            setSelectedMethod(options[0].id);
          }
        } else {
          setDeliveryOptions([]);
        }
      } catch (error) {
        console.error("Error fetching delivery methods:", error);
        addToast({
          title: t("general.error.title"),
          description: t("general.error.somethingWentWrong"),
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryMethods();
  }, [selectedAddress?.id, cartData?.id]);

  const getIconForMethod = (methodId: string) => {
    switch (methodId) {
      case "self_pickup":
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case "farmer_delivery":
        return <User className="w-5 h-5 text-green-500" />;
      case "delivery_boy":
        return <Truck className="w-5 h-5 text-orange-500" />;
      default:
        return <Truck className="w-5 h-5" />;
    }
  };

  const handleMethodChange = async (methodId: string) => {
    const selectedOption = deliveryOptions.find((opt) => opt.id === methodId);
    const methodCode = selectedOption?.code || methodId;

    setSelectedMethod(methodId);
    dispatch(setDeliveryMethod(methodCode));

    // Calculate fee for selected method
    if (cartData?.id) {
      try {
        const result = await calculateDeliveryFee({
          order_id: cartData.id,
          delivery_method: methodCode,
        });

        if (result.success && result.data?.fee !== undefined) {
          dispatch(setDeliveryFee(result.data.fee));
        }
      } catch (error) {
        console.error("Error calculating delivery fee:", error);
      }
    }

    // Update cart data
    setTimeout(() => {
      updateCartData(true, false);
    }, 500);
  };

  if (!selectedAddress?.id) {
    return (
      <Card className="w-full" radius="md" shadow="sm">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Truck className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-semibold text-xs md:text-small">
                {t("delivery.selectAddress") || "Select Address First"}
              </p>
              <p className="text-xxs md:text-xs text-default-500">
                {t("delivery.selectAddressDescription") || "Please select a delivery address to see available delivery methods"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full" radius="md" shadow="sm">
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-xs md:text-small">
              {t("delivery.selectMethod") || "Delivery Method"}
            </p>
            <p className="text-xxs md:text-xs text-default-500">
              {t("delivery.selectMethodDescription") || "Choose how you want your order delivered"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : deliveryOptions.length > 0 ? (
          <RadioGroup
            value={selectedMethod}
            onValueChange={handleMethodChange}
            className="gap-3"
          >
            {deliveryOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <Radio value={option.id} className="flex-shrink-0" />
                <div className="ml-3 flex-grow">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div>
                      <p className="font-semibold text-sm">{option.name}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {option.fee === 0 ? (
                      <span className="text-green-600">{t("delivery.free") || "Free"}</span>
                    ) : (
                      `${currencySymbol}${option.fee.toFixed(2)}`
                    )}
                  </p>
                  {option.badge && (
                    <p className="text-xs text-primary">{option.badge}</p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              {t("delivery.noMethodsAvailable") || "No delivery methods available for this location"}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DeliveryMethodSelector;
