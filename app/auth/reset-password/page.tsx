"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link.");
      }

      toast({
        title: "Reset link sent",
        description: "Check your email for a link to reset your password.",
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending reset link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your email and we&#39;ll send you a link to reset your password
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 border rounded-lg">
            <p className="text-sm">
              We&#39;ve sent a password reset link to your email. Please check your inbox.
            </p>
          </div>
          <Button className="w-full cursor-pointer" asChild>
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </Form>
      )}

      <div className="text-sm text-center">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}