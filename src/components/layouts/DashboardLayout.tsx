import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useAuth } from "@/lib/auth/context";
import { OrganizationProvider } from "@/lib/organization-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import OrganizationSelector from "@/components/OrganizationSelector";
import {
  Settings,
  Users,
  HelpCircle,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: "settings" | "members";
}

export function DashboardLayout({
  children,
  currentPage = "settings",
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <OrganizationProvider>
      <Head>
        <title>CodePress Dashboard</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.svg"
              alt="CodePress Logo"
              width={89}
              height={32}
              className="h-auto"
            />
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none focus:outline-none"
                  aria-haspopup="menu"
                >
                  <UserAvatar
                    className="w-10 h-10"
                    src={user?.avatarUrl}
                    name={
                      user?.githubUsername ||
                      user?.email?.split("@")[0] ||
                      undefined
                    }
                    email={user?.email}
                    login={user?.githubUsername || undefined}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-[73px]">
        {/* Sidebar - Fixed */}
        <aside className="fixed left-0 top-[73px] w-80 h-[calc(100vh-73px)]">
          <div className="p-6 pt-2">
            {/* Organization Selector */}
            <div className="mb-2">
              <OrganizationSelector
                placeholder="Choose your organization..."
                className="w-full"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <div 
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  currentPage === "settings"
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => router.push("/dashboard")}
              >
                <Settings className="w-5 h-5" />
                <span className={currentPage === "settings" ? "font-medium" : ""}>
                  Workspace settings
                </span>
              </div>
              <div 
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  currentPage === "members"
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => router.push("/dashboard/members")}
              >
                <Users className="w-5 h-5" />
                <span className={currentPage === "members" ? "font-medium" : ""}>
                  Members
                </span>
              </div>
              {/* Separator */}
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 ml-80 h-[calc(100vh-73px)] overflow-y-auto">
          {children}
        </main>
      </div>
      </div>
    </OrganizationProvider>
  );
}