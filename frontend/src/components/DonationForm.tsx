import React, { useState } from "react";
import { Button } from "./Button";
import { Loader2 } from "lucide-react";
// import { FormService } from "../utils/formService";
import { FormServiceFallback as FormService } from "../utils/formServiceFallback";
import { trackEvent } from "../utils/analytics";

interface Props {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DonationForm({ onSuccess, onError }: Props) {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      // Track the donation attempt
      trackEvent("donation", "attempt", { amount: parseFloat(amount) });

      // Record donation in Firebase
      await FormService.submitDonation({
        name: "", // Could be added as a form field in the future
        email: email || "anonymous@donor.com",
        amount: parseFloat(amount),
        message: ""
      });
      
      // Call legacy payment API to maintain compatibility
      try {
        // Fetch Cash App URL from the backend
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: "USD",
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Track successful payment creation
          trackEvent("donation", "payment_created", { amount: parseFloat(amount) });

          // Open Cash App payment URL in new window
          window.open(data.payment_url, "_blank", "noopener,noreferrer");
        } else {
          console.warn("Cash App payment URL generation failed, but donation was recorded in Firebase");
        }
      } catch (paymentError) {
        console.warn("Cash App payment URL generation failed, but donation was recorded in Firebase", paymentError);
      }
      
      // Reset form
      setAmount("");
      setEmail("");

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process donation";
      setError(errorMessage);
      onError?.(errorMessage);

      // Track payment error
      trackEvent("donation", "error", { error: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const presetAmounts = [5, 10, 25, 50, 100];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Preset amounts */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset.toString())}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
              amount === preset.toString()
                ? "bg-primary-500 text-white"
                : "bg-secondary-800 text-gray-300 hover:bg-primary-500/10"
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>

      {/* Custom amount input */}
      <div>
        <label htmlFor="amount" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          Enter Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">
            $
          </span>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
            className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg bg-secondary-800 text-white border border-gray-600
                     focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Email input (optional) */}
      <div>
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
          Email (optional)
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg bg-secondary-800 text-white border border-gray-600
                   focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="your@email.com"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !amount}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Donate $${amount || "0"}`
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        You will be redirected to Cash App to complete your donation securely.
      </p>
    </form>
  );
}
