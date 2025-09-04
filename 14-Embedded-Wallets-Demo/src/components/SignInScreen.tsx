"use client";

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { CustomAuth } from "@/components/CustomAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

/**
 * Enhanced Sign in screen with modern design
 */
export default function SignInScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 CDP Embedded Wallets
          </h1>
          <p className="text-gray-600">
            Experience the future of wallet authentication
          </p>
        </div>

        {/* Main Sign In Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>
              Sign in with your email to access your embedded wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="w-full">
              <CustomAuth />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or use default UI
                </span>
              </div>
            </div>
            
            <AuthButton />
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">✨ Embedded Wallets Features</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Passwordless email authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Smart account capabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Seamless transaction sending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Coinbase infrastructure</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Powered by Coinbase Developer Platform</p>
          <p className="mt-1">
            Secure • Fast • User-friendly
          </p>
        </div>
      </div>
    </div>
  );
}
