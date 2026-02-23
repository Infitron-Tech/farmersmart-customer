import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import dynamic from "next/dynamic";

const SellerRegisterModal = dynamic(
  () => import("@/components/Modals/SellerRegisterModal"),
  { ssr: false }
);

const BecomeFarmerButton: FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  if (isLoggedIn) return null;

  return (
    <li>
      <SellerRegisterModal
        trigger={
          <button className="hover:text-green-400 transition-colors duration-300 text-sm cursor-pointer">
            Become a Farmer
          </button>
        }
      />
    </li>
  );
};

export default BecomeFarmerButton;
