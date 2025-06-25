"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Scan, History, BarChart3, Settings, User, Info, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { title: "Analyse", url: "/dashboard", icon: Scan, badge: "IA" },
  { title: "Historique", url: "/dashboard/history", icon: History },
  { title: "Statistiques", url: "/dashboard/statistics", icon: BarChart3 },
  { title: "Info", url: "/dashboard/info", icon: Info, badge: "DOC" },
  { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  useEffect(() => {
    setFirstName(localStorage.getItem("first_name") || "")
    setLastName(localStorage.getItem("last_name") || "")
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  return (
    <Sidebar variant="inset" className="border-r border-border/50 bg-card">
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-foreground">PneumoDetect</h2>
            <p className="text-xs text-muted-foreground font-medium">Détection IA</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="w-full justify-start hover-lift transition-all-smooth rounded-xl h-12"
                  >
                    <Link href={item.url} className="flex items-center space-x-3 px-4">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 space-y-2">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-muted/50 hover-lift transition-all-smooth">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
              {getInitials(`${firstName} ${lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {firstName} {lastName}
            </p>
          </div>
          <User className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* 🔥 Bouton de déconnexion */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
