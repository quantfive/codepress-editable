import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitWaitlist } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  source?: string;
}

export default function WaitlistModal({
  open,
  onOpenChange,
  source,
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setIsSubmitting(false);
      setMessage(null);
      setSubmitted(false);
      setSubmittedEmail(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setMessage(null);
    const result = await submitWaitlist(email, source);
    setIsSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
      setSubmittedEmail(email);
      setMessage(null);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {submitted ? (
          <div className="flex flex-col items-center text-center gap-4">
            <Image
              src="/logo.svg"
              alt="Code Press Logo"
              width={89}
              height={32}
              className="h-auto"
            />
            <DialogHeader>
              <DialogTitle className="text-center">
                You're on the waitlist!
              </DialogTitle>
              <DialogDescription>
                We'll email {submittedEmail ?? "you"} when it's your turn.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="trial"
              className="rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Join the waitlist</DialogTitle>
              <DialogDescription>
                The first 1,000 users will get 70% off the first year.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="waitlist-email">Email</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="trial"
                className="rounded-full"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Join"
                )}
              </Button>
              {message && <p className="text-sm text-gray-600">{message}</p>}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
