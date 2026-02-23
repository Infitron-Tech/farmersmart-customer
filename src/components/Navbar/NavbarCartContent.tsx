import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import dynamic from "next/dynamic";
import { Link, NavbarItem } from "@heroui/react";
import { ShoppingCart } from "lucide-react";

const Badge = dynamic(() => import("@heroui/react").then((mod) => mod.Badge), {
  ssr: false,
});

const NavbarCartContent: FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const cartCount =
    useSelector((state: RootState) => state.cart.cartData?.items_count) || 0;
  const offLineCartCount =
    useSelector((state: RootState) => state.offlineCart.items)?.length || 0;

  return (
    <NavbarItem>
      <Badge
        color="primary"
        content={
          isLoggedIn
            ? cartCount || undefined
            : offLineCartCount || undefined
        }
        variant="solid"
        classNames={{ badge: "text-xs" }}
      >
        <Link href="/cart">
          <ShoppingCart className="text-default-500 cursor-pointer" />
        </Link>
      </Badge>
    </NavbarItem>
  );
};

export default NavbarCartContent;
