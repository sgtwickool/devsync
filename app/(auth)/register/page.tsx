import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Code2 } from "lucide-react";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl = params.callbackUrl || ""
  const loginLink = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <Code2 className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold">DevSync</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-2 text-gray-600">Start organizing your code snippets</p>
        </div>
        
        <RegisterForm />
        
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href={loginLink} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
