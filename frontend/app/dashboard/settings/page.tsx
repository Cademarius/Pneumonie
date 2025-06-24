"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { updateProfile, changePassword } from "@/services/authservice"; // <- ajout

import {
  User,
  Mail,
  Lock,
  Moon,
  Sun,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  Bell,
  Palette,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analysis: true,
    reports: true,
  })
  const [saveMessage, setSaveMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Charger les informations utilisateur
    const email = localStorage.getItem("userEmail") || ""
    const userName = localStorage.getItem("userName") || ""
    const nameParts = userName.replace("Dr. ", "").split(" ")

    setUserInfo((prev) => ({
      ...prev,
      email,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
    }))

    // Vérifier le thème actuel
    const currentTheme = localStorage.getItem("theme") || "light"
    setIsDarkMode(currentTheme === "dark")

    // Appliquer le thème
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  
const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setSaveMessage("");

  try {
    await updateProfile({
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      email: userInfo.email,
    });

    localStorage.setItem("userEmail", userInfo.email);
    localStorage.setItem(
      "userName",
      `Dr. ${userInfo.firstName} ${userInfo.lastName}`
    );

    setSaveMessage("Profil mis à jour avec succès !");
  } catch (err: any) {
    setSaveMessage(err.message || "Erreur lors de la mise à jour du profil");
  } finally {
    setIsLoading(false);
  }
};

const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setSaveMessage("");

  if (userInfo.newPassword !== userInfo.confirmPassword) {
    setSaveMessage("Les mots de passe ne correspondent pas");
    setIsLoading(false);
    return;
  }

  if (userInfo.newPassword.length < 6) {
    setSaveMessage("Le mot de passe doit contenir au moins 6 caractères");
    setIsLoading(false);
    return;
  }

  try {
  console.log('Payload', { current_password: userInfo.currentPassword, new_password: userInfo.newPassword })
  await changePassword({ current_password: userInfo.currentPassword, new_password: userInfo.newPassword })

    setSaveMessage("Mot de passe modifié avec succès !");
    setUserInfo((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  } catch (err: any) {
    setSaveMessage(err.message || "Erreur lors du changement de mot de passe");
  } finally {
    setIsLoading(false);
  }
};


  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked)
    localStorage.setItem("theme", checked ? "dark" : "light")

    // Appliquer le thème immédiatement
    if (checked) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    localStorage.setItem("notifications", JSON.stringify({ ...notifications, [key]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("analysisHistory")
    localStorage.removeItem("theme")
    localStorage.removeItem("notifications")
    localStorage.removeItem("access_token") // Ajout du token d'accès à supprimer
    router.push("/auth/login")
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Gérez votre compte et personnalisez votre expérience</p>
          </div>
        </div>
      </div>

      {/* Message de sauvegarde */}
      {saveMessage && (
        <Alert
          className={`animate-fade-in ${saveMessage.includes("succès") ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}
        >
          {saveMessage.includes("succès") ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              saveMessage.includes("succès") ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
            }
          >
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du profil */}
        <Card className="hover-lift transition-all-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Informations du profil</span>
            </CardTitle>
            <CardDescription>Modifiez vos informations personnelles</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={userInfo.firstName}
                    onChange={handleInputChange}
                    placeholder="Jean"
                    className="transition-all-smooth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={userInfo.lastName}
                    onChange={handleInputChange}
                    placeholder="Dupont"
                    className="transition-all-smooth"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className="pl-10 transition-all-smooth"
                    placeholder="docteur@hopital.fr"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="hover-lift">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Sauvegarde..." : "Sauvegarder le profil"}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Changement de mot de passe */}
        <Card className="hover-lift transition-all-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Sécurité</span>
            </CardTitle>
            <CardDescription>Modifiez votre mot de passe</CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={userInfo.currentPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 transition-all-smooth"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={userInfo.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 transition-all-smooth"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={userInfo.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 transition-all-smooth"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="hover-lift">
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? "Modification..." : "Changer le mot de passe"}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Préférences d'affichage */}
        <Card className="hover-lift transition-all-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <span>Apparence</span>
            </CardTitle>
            <CardDescription>Personnalisez l'interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Sun className="h-4 w-4 text-yellow-600" />
                  )}
                  <Label className="font-medium">Mode sombre</Label>
                </div>
                <p className="text-sm text-muted-foreground">Basculer entre le thème clair et sombre</p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="hover-lift transition-all-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Gérez vos préférences de notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "email", label: "Notifications par email", description: "Recevoir les rapports par email" },
              { key: "push", label: "Notifications push", description: "Alertes en temps réel" },
              { key: "analysis", label: "Fin d'analyse", description: "Notification à la fin de chaque analyse" },
              { key: "reports", label: "Rapports hebdomadaires", description: "Résumé hebdomadaire des analyses" },
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="font-medium">{notification.label}</Label>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                </div>
                <Switch
                  checked={notifications[notification.key as keyof typeof notifications]}
                  onCheckedChange={(checked) => handleNotificationChange(notification.key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions du compte */}
      <Card className="hover-lift transition-all-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LogOut className="h-5 w-5 text-red-600" />
            <span>Actions du compte</span>
          </CardTitle>
          <CardDescription>Gérer votre session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Zone de danger</span>
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Cette action vous déconnectera de votre session actuelle et supprimera vos données locales.
            </p>
            <Button variant="destructive" onClick={handleLogout} className="hover-lift">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}