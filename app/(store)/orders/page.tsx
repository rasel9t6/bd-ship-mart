import { getUserOrders } from "@/lib/actions/actions";
import { authOptions } from "@/lib/authOption";

import { OrderItem } from "@/types/next-utils";
import { getServerSession } from "next-auth";
import Image from "next/image";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  const orders = await getUserOrders(userId);

  return (
    <div className="px-10 py-5 max-sm:px-3">
      <p className="my-10 text-heading3-bold">All Orders</p>

      {(!orders || orders.length === 0) && (
        <p className="my-5 text-body-bold">No orders have been placed yet.</p>
      )}

      <div className="flex flex-col gap-10">
        {orders?.map((order: OrderItem) => (
          <div
            key={order._id}
            className="flex flex-col gap-8 rounded-lg border p-4 hover:bg-custom-gray"
          >
            {/* Order ID, Customer Name, and Total Amount */}
            <div className="flex flex-wrap gap-6 max-md:flex-col">
              <p className="text-base-bold">Order ID: {order.orderId}</p>
              <p className="text-base-bold">
                Customer: {order.customer?.name || "Unknown Customer"}
              </p>
              <p className="text-base-bold">
                Total Amount: ৳{order.totalAmount?.bdt || 0}
              </p>
              <p className="text-base-bold text-gray-600">
                Status: {order.status}
              </p>
              <p className="text-small-medium text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Ordered Products */}
            <div className="flex flex-col gap-5">
              {order.products.map((orderProduct, index) => (
                <div
                  key={`${order._id}-product-${index}`}
                  className="flex gap-4"
                >
                  {orderProduct.product ? (
                    <>
                      <Image
                        src={
                          typeof orderProduct.product === "object" &&
                          orderProduct.product.media?.[0]
                            ? typeof orderProduct.product.media[0] === "string"
                              ? orderProduct.product.media[0]
                              : orderProduct.product.media[0].url
                            : "/not-found.gif"
                        }
                        alt={orderProduct.title || "Product image"}
                        width={100}
                        height={100}
                        className="size-32 rounded-lg object-cover"
                      />
                      <div className="flex flex-col justify-between">
                        <p className="text-small-medium">
                          Title:{" "}
                          <span className="text-small-bold">
                            {orderProduct.title}
                          </span>
                        </p>
                        {orderProduct.color && (
                          <p className="text-small-medium">
                            Color:{" "}
                            <span className="text-small-bold">
                              {orderProduct.color}
                            </span>
                          </p>
                        )}
                        {orderProduct.size && (
                          <p className="text-small-medium">
                            Size:{" "}
                            <span className="text-small-bold">
                              {orderProduct.size}
                            </span>
                          </p>
                        )}
                        <p className="text-small-medium">
                          Unit price:{" "}
                          <span className="text-small-bold">
                            ৳{orderProduct.unitPrice?.bdt || "N/A"}
                          </span>
                        </p>
                        <p className="text-small-medium">
                          Quantity:{" "}
                          <span className="text-small-bold">
                            {orderProduct.quantity}
                          </span>
                        </p>
                        <p className="text-small-medium">
                          Total:{" "}
                          <span className="text-small-bold">
                            ৳{orderProduct.totalPrice?.bdt || "N/A"}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-small-medium text-red-500">
                      Product information is unavailable.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Shipping and Payment information */}
            <div className="flex flex-wrap gap-x-10 gap-y-2 text-small-medium">
              <p>
                Shipping Method:{" "}
                <span className="font-medium">
                  {order.shippingMethod || "N/A"}
                </span>
              </p>
              <p>
                Delivery Type:{" "}
                <span className="font-medium">
                  {order.deliveryType || "N/A"}
                </span>
              </p>
              {order.estimatedDeliveryDate && (
                <p>
                  Estimated Delivery:{" "}
                  <span className="font-medium">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
