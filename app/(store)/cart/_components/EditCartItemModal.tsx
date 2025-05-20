import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartProductVariant } from "@/hooks/useCart";
import Image from "next/image";

interface EditCartItemModalProps {
  open: boolean;
  item: CartProductVariant;
  onClose: () => void;
  onUpdate: (item: CartProductVariant) => void;
  onDelete: () => void;
  onMinQty: () => void;
}

const EditCartItemModal: React.FC<EditCartItemModalProps> = ({
  open,
  item,
  onClose,
  onUpdate,
  onDelete,
  onMinQty,
}) => {
  const minOrderQty = 1;
  const [quantity, setQuantity] = useState(item.quantity);

  const handleDecrease = () => {
    if (quantity <= minOrderQty) {
      onMinQty();
      return;
    }
    setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleUpdate = () => {
    onUpdate({
      ...item,
      quantity,
      totalPrice: {
        bdt: item.unitPrice.bdt * quantity,
        usd: item.unitPrice.usd * quantity,
        cny: item.unitPrice.cny * quantity,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Edit Cart Item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-medium">Color:</span>
            {item.color && (
              <div className="relative h-6 w-6 rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={
                    item.color.startsWith("http")
                      ? item.color
                      : `/api/media/${item.color}`
                  }
                  alt="Color"
                  fill
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            {item.size && <span className="ml-4">Size: {item.size}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">Quantity:</span>
            <Button variant="outline" size="icon" onClick={handleDecrease}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button variant="outline" size="icon" onClick={handleIncrease}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">Subtotal:</span>
            <span className="text-gray-900 font-semibold">
              ৳{item.unitPrice.bdt * quantity}
            </span>
          </div>
        </div>
        <DialogFooter className="flex justify-between mt-6">
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCartItemModal;
