import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import dynamic from "next/dynamic";

const ProfileBtn = dynamic(() => import("@/components/ProfileBtn"), {
  ssr: false,
});

const LoginModal = dynamic(() => import("@/components/Modals/LoginModal"), {
  ssr: false,
});

const HeaderAuthContent: FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return isLoggedIn ? <ProfileBtn /> : <LoginModal />;
};

export default HeaderAuthContent;
