import { useNavigate } from "react-router-dom";
import { useCartStore } from "./cart";
import { useProductModalStore } from "./productModal";
import { products } from "./products";
import { ChatEvent } from "./types";

type EventHandlerDeps = {
  navigate: ReturnType<typeof useNavigate>;
  toast: any;
};

export const handleChatEvent = (event: ChatEvent, { navigate, toast }: EventHandlerDeps) => {
  console.log("AI Event:", event);
  const { addItem: addToCart } = useCartStore.getState();
  const { setSelectedProduct } = useProductModalStore.getState();

  switch (event.name) {
    // Product Browsing & Shopping Cart
    case "view-product": {
      const productToView = products.find(p => p.id.toString() === event.data.productId);
      if (productToView) {
        setSelectedProduct(productToView);
        toast({
          title: "Product Details",
          description: `Showing details for ${productToView.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Product Not Found",
          description: "Sorry, we couldn't find that product."
        });
      }
      break;
    }

    case "add-to-cart": {
      const productToAdd = products.find(p => p.id.toString() === event.data.productId);
      if (productToAdd) {
        try {
          addToCart({
            id: productToAdd.id.toString(),
            name: productToAdd.name,
            price: productToAdd.price,
            category: productToAdd.category,
            image: productToAdd.image,
            quantity: event.data.quantity || 1
          });
          
          toast({
            title: "Added to Cart",
            description: `${productToAdd.name} has been added to your cart.`,
            action: {
              label: "View Cart",
              onClick: () => navigate("/Cart")
            },
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add item to cart. Please try again."
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Product Not Found",
          description: "Sorry, we couldn't find that product."
        });
      }
      break;
    }

    case "remove-from-cart": {
      const { removeItem } = useCartStore.getState();
      try {
        removeItem(event.data.productId);
        toast({
          title: "Removed from Cart",
          description: "Item has been removed from your cart.",
          action: {
            label: "View Cart",
            onClick: () => navigate("/Cart")
          },
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove item from cart. Please try again."
        });
      }
      break;
    }

    // Orders & Payments
    case "place-order": {
      try {
        const { items, total } = useCartStore.getState();
        if (items.length === 0) {
          toast({
            variant: "destructive",
            title: "Empty Cart",
            description: "Your cart is empty. Add some items before placing an order."
          });
          return;
        }

        const orderId = `OA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        localStorage.setItem("currentOrder", JSON.stringify({
          id: orderId,
          items,
          total,
          status: "pending"
        }));

        toast({
          title: "Order Created",
          description: `Order ${orderId} has been created. Please select a payment method.`,
          action: {
            label: "View Cart",
            onClick: () => navigate("/Cart")
          },
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create order. Please try again."
        });
      }
      break;
    }

    // Support & Help
    case "get-support": {
      const { issueType, urgency } = event.data;
      navigate(`/support?type=${encodeURIComponent(issueType)}&urgency=${encodeURIComponent(urgency)}`);
      break;
    }

    case "report-side-effect": {
      const { productId, symptom, severity } = event.data;
      navigate(`/report-side-effect?product=${encodeURIComponent(productId)}&symptom=${encodeURIComponent(symptom)}&severity=${encodeURIComponent(severity)}`);
      break;
    }

    // Shipping & Tracking
    case "track-order": {
      const { orderId } = event.data;
      navigate(`/track-order/${encodeURIComponent(orderId)}`);
      break;
    }

    case "shipping-query": {
      const { topic, country } = event.data;
      navigate(`/shipping-info?topic=${encodeURIComponent(topic)}&country=${encodeURIComponent(country)}`);
      break;
    }

    default:
      console.log("Unknown event:", event);
  }
};
