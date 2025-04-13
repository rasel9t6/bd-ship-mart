import { authOptions } from "@/lib/authOption";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import ProductCard from "../products/_components/ProductCard";
import User from "@/models/User";
import { ProductType } from "@/types/next-utils";

export default async function WishlistPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      toast.error("Please sign in to view your wishlist");
      return redirect("/sign-in");
    }

    const user = await User.findById(session.user.id).populate("wishlist");
    if (!user) {
      toast.error("User not found");
      return redirect("/");
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.wishlist.map((product: ProductType) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    toast.error(`Failed to load wishlist | ${error}`);
    return redirect("/");
  }
}

export const dynamic = "force-dynamic";
