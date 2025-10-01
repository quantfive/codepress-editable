import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeAndSyncAuthToken } from "@/lib/utils";
import { fetchBackend } from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/router";

function getSafeRedirect(callback?: string): string | null {
  if (!callback) return null;

  try {
    // If it's a relative path (starts with "/"), allow it
    if (callback.startsWith("/")) {
      return callback;
    }

    // If it's an absolute URL, parse and check the hostname
    const url = new URL(callback, window.location.origin);
    if (url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash;
    }

    // Otherwise, block it
    return null;
  } catch {
    return null;
  }
}

// Helper function to convert technical error messages to user-friendly ones
const getErrorMessage = (errorDetail: string): string => {
  const lowerError = errorDetail.toLowerCase();

  if (
    lowerError.includes("login_bad_credentials") ||
    lowerError.includes("bad_credentials") ||
    lowerError.includes("invalid credentials") ||
    lowerError.includes("authentication failed")
  ) {
    return "We couldn't log you in with that email and password combination. Please check your credentials and try again.";
  }

  if (
    lowerError.includes("user_not_exists") ||
    lowerError.includes("user not found")
  ) {
    return "We couldn't find an account with that email address. Please check the email or sign up for a new account.";
  }

  if (
    lowerError.includes("user_inactive") ||
    lowerError.includes("account disabled")
  ) {
    return "Your account has been disabled. Please contact support for assistance.";
  }

  if (
    lowerError.includes("too_many_requests") ||
    lowerError.includes("rate limit")
  ) {
    return "Too many login attempts. Please wait a few minutes before trying again.";
  }

  // Return the original error if we don't have a specific translation
  return errorDetail;
};

type FormState = "login" | "signup" | "verification";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formState, setFormState] = useState<FormState>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchBackend.request(
        "/auth/jwt/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password,
          }),
        },
        { skipAuth: true, additionalHeaders: { "x-skip-auth": "true" } }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = getErrorMessage(
          errorData.detail || "Login failed"
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store token and sync with Chrome extension
      await storeAndSyncAuthToken(data.access_token);
      // Update auth context by fetching the current user immediately
      await login(data.access_token);

      // Redirect to callback (invitations) if exists
      const safeCallback = getSafeRedirect(router.query.callback as string);
      if (safeCallback) {
        router.push(safeCallback);
        return;
      }

      // Check if user has organizations, if not redirect to onboarding
      const orgResponse = await fetchBackend.get("/organizations");

      if (orgResponse.ok) {
        const orgs = await orgResponse.json();
        if (orgs.length === 0) {
          window.location.href = "/onboarding";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        window.location.href = "/onboarding"; // Default to onboarding if we can't check
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchBackend.post(
        "/auth/send-verification-code",
        { email },
        { skipAuth: true, additionalHeaders: { "x-skip-auth": "true" } }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = getErrorMessage(
          errorData.detail || "Failed to send verification code"
        );
        throw new Error(errorMessage);
      }

      setMessage("Verification code sent to your email");
      setFormState("verification");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First verify the email
      const verifyResponse = await fetchBackend.post("/auth/verify-email", {
        email,
        code: verificationCode,
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        const errorMessage = getErrorMessage(
          errorData.detail || "Invalid verification code"
        );
        throw new Error(errorMessage);
      }

      // Then create the user account
      const signupResponse = await fetchBackend.post("/auth/signup", {
        email,
        password,
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        const errorMessage = getErrorMessage(
          errorData.detail || "Signup failed"
        );
        throw new Error(errorMessage);
      }

      const data = await signupResponse.json();

      // Store token and sync with Chrome extension
      await storeAndSyncAuthToken(data.access_token);
      // Update auth context by fetching the current user immediately
      await login(data.access_token);

      // Redirect to callback (invitations) if exists
      const safeCallback = getSafeRedirect(router.query.callback as string);
      if (safeCallback) {
        router.push(safeCallback);
        return;
      }
      // Check if user has organizations, if not redirect to onboarding
      const orgResponse = await fetchBackend.get("/organizations");

      if (orgResponse.ok) {
        const orgs = await orgResponse.json();
        if (orgs.length === 0) {
          window.location.href = "/onboarding";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        window.location.href = "/onboarding"; // Default to onboarding if we can't check
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "github" | "google" | "apple") => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchBackend.get(
        `/auth/${provider}/authorize-url`,
        { skipAuth: true, additionalHeaders: { "x-skip-auth": "true" } }
      );
      const data = await response.json();

      if (response.ok) {
        // Redirect to OAuth provider
        window.location.href = data.url;
      } else {
        setError(`Failed to start ${provider} login`);
        console.error(`Failed to start ${provider} login: `, data);
        setIsLoading(false);
      }
    } catch (_err) {
      setError(`Failed to start ${provider} login`);
      console.error(`Failed to start ${provider} login: `, _err);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setVerificationCode("");
    setError("");
    setMessage("");
    setFormState("login");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {formState === "login" && "Welcome back"}
            {formState === "signup" && "Create your account"}
            {formState === "verification" && "Verify your email"}
          </CardTitle>
          <CardDescription>
            {formState === "login" && "Log in to your CodePress account"}
            {formState === "signup" && "Enter your email to get started"}
            {formState === "verification" &&
              "Enter the 6-digit code sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-md">
              {message}
            </div>
          )}

          {formState === "login" && (
            <form onSubmit={handleEmailLogin}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin("apple")}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>
                    Continue with Apple
                  </Button> */}
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with email
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setFormState("signup")}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
          )}

          {formState === "signup" && (
            <form onSubmit={handleSendVerificationCode}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin("apple")}
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>
                    Continue with Apple
                  </Button> */}
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with email
                  </span>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setFormState("login")}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </form>
          )}

          {formState === "verification" && (
            <form onSubmit={handleVerifyAndSignup}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify and create account"}
                </Button>
                <div className="text-center text-sm space-y-2">
                  <div>
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      className="underline underline-offset-4 hover:text-primary"
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Back to login
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
