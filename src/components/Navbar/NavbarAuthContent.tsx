import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import dynamic from "next/dynamic";
import { NavbarItem } from "@heroui/react";

const ProfileBtn = dynamic(() => import("../ProfileBtn"), { ssr: false });
const LoginModal = dynamic(() => import("../Modals/LoginModal"), { ssr: false });

const NavbarAuthContent: FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <NavbarItem>
      {isLoggedIn ? (
        <ProfileBtn />
      ) : (
        <LoginModal triggerView="icon" />
      )}
    </NavbarItem>
  );
};

export default NavbarAuthContent;
