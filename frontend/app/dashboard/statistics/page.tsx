"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Activity,
  Calendar,
  Target,
  PieChart as PieChartIcon,
  TrendingUp as LineChartIcon,
  Download,
  RefreshCw,
  Zap,
  BarChart3,
  AlertCircle,
} from "lucide-react"

interface Patient {
  id: number
  nom: string
  prenom: string
  age: number
  sexe: string
}

interface AnalysisRecord {
  id: number
  file_name: string
  verdict: string
  probability: number
  confidence: string
  timestamp: string
  patient: Patient
  imageUrl: string
}

export default function StatisticsPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [timeRange, setTimeRange] = useState("6months")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer les données depuis l'API
  const fetchAnalysisHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const response = await fetch("http://localhost:8000/history/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée, veuillez vous reconnecter")
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalyses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données")
      console.error("Erreur lors de la récupération des données:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysisHistory()
  }, [])

  // Filtrage par période
  const getFilteredAnalyses = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeRange) {
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case "all":
      default:
        return analyses
    }
    
    return analyses.filter(analysis => 
      new Date(analysis.timestamp) >= cutoffDate
    )
  }

  const filteredAnalyses = getFilteredAnalyses()

  // Calculs des métriques basés sur les données réelles de l'API
  const totalAnalyses = filteredAnalyses.length
  const pneumoniaDetected = filteredAnalyses.filter((a) => a.verdict.toLowerCase() === "positive" || a.verdict.toLowerCase() === "pneumonia").length
  const normalCases = filteredAnalyses.filter((a) => a.verdict.toLowerCase() === "negative" || a.verdict.toLowerCase() === "normal").length
  const detectionRate = totalAnalyses > 0 ? ((pneumoniaDetected / totalAnalyses) * 100).toFixed(1) : "0"
  const avgProbability = totalAnalyses > 0 ? (filteredAnalyses.reduce((sum, a) => sum + a.probability, 0) / totalAnalyses).toFixed(1) : "0"

  // Calcul de la distribution de confiance
  const confidenceDistribution = {
    high: filteredAnalyses.filter(a => a.confidence.toLowerCase() === "high").length,
    medium: filteredAnalyses.filter(a => a.confidence.toLowerCase() === "medium").length,
    low: filteredAnalyses.filter(a => a.confidence.toLowerCase() === "low").length,
  }

  // Données pour le graphique en secteurs
  const pieData = [
    {
      name: "Radiographies Normales",
      value: normalCases,
      color: "#10b981",
      gradient: "url(#normalGradient)",
      percentage: totalAnalyses > 0 ? ((normalCases / totalAnalyses) * 100).toFixed(1) : "0",
      description: "Aucune anomalie détectée",
    },
    {
      name: "Pneumonies Détectées",
      value: pneumoniaDetected,
      color: "#ef4444",
      gradient: "url(#pneumoniaGradient)",
      percentage: totalAnalyses > 0 ? ((pneumoniaDetected / totalAnalyses) * 100).toFixed(1) : "0",
      description: "Signes de pneumonie identifiés",
    },
  ]

  // Génération des données temporelles basées sur les vraies données
  const generateTimelineData = () => {
    const monthlyStats = new Map()
    
    filteredAnalyses.forEach(analysis => {
      const date = new Date(analysis.timestamp)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthName,
          analyses: 0,
          pneumonies: 0,
          totalProbability: 0,
          highConfidence: 0,
        })
      }
      
      const stats = monthlyStats.get(monthKey)
      stats.analyses += 1
      stats.totalProbability += analysis.probability
      
      if (analysis.verdict.toLowerCase() === "positive" || analysis.verdict.toLowerCase() === "pneumonia") {
        stats.pneumonies += 1
      }
      
      if (analysis.confidence.toLowerCase() === "high") {
        stats.highConfidence += 1
      }
    })

    return Array.from(monthlyStats.values())
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .map(stats => ({
        ...stats,
        precision: stats.analyses > 0 ? ((stats.highConfidence / stats.analyses) * 100).toFixed(1) : 0,
        avgProbability: stats.analyses > 0 ? (stats.totalProbability / stats.analyses).toFixed(1) : 0,
      }))
  }

  const timelineData = generateTimelineData()

  const handleExportStats = () => {
    const statsData = {
      totalAnalyses,
      pneumoniaDetected,
      normalCases,
      detectionRate: `${detectionRate}%`,
      avgProbability: `${avgProbability}%`,
      confidenceDistribution,
      generatedAt: new Date().toISOString(),
      timeRange,
      pieData,
      timelineData,
      detailedAnalyses: filteredAnalyses,
    }

    const dataStr = JSON.stringify(statsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `statistiques-pneumodetect-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Fonction pour le hover du pie chart
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  // Custom label pour le pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium text-red-600 mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalysisHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Analytique</h1>
            <p className="text-muted-foreground">
              Analyse de {totalAnalyses} radiographies avec {pneumoniaDetected} détections de pneumonie
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportStats} className="hover-lift">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={fetchAnalysisHistory} className="hover-lift">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">6 derniers mois</SelectItem>
            <SelectItem value="year">12 derniers mois</SelectItem>
            <SelectItem value="all">Toute la période</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Activity,
            label: "Total Analyses",
            value: totalAnalyses,
            change: timeRange === "all" ? "Toutes" : `${timeRange}`,
            color: "text-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
          },
          {
            icon: Target,
            label: "Pneumonies Détectées",
            value: pneumoniaDetected,
            change: `${detectionRate}%`,
            color: "text-red-600",
            bgColor: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
          },
          {
            icon: TrendingUp,
            label: "Probabilité Moyenne",
            value: `${avgProbability}%`,
            change: "Moyenne",
            color: "text-green-600",
            bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
          },
          {
            icon: Zap,
            label: "Confiance Élevée",
            value: confidenceDistribution.high,
            change: `${totalAnalyses > 0 ? ((confidenceDistribution.high / totalAnalyses) * 100).toFixed(1) : 0}%`,
            color: "text-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
          },
        ].map((stat, index) => (
          <Card key={index} className="hover-lift transition-all-smooth border-0 shadow-lg">
            <CardContent className={`p-6 ${stat.bgColor} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs font-semibold bg-white/60 dark:bg-gray-800/60">
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Répartition des diagnostics */}
        <Card className="hover-lift transition-all-smooth shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <PieChartIcon className="h-6 w-6 text-white" />
              </div>
              <span>Répartition des Diagnostics</span>
            </CardTitle>
            <CardDescription className="text-base">
              Distribution entre radiographies normales et pneumonies détectées
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {totalAnalyses > 0 ? (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <defs>
                      <linearGradient id="normalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="pneumoniaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1200}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.gradient}
                          stroke={activeIndex === index ? "#ffffff" : "none"}
                          strokeWidth={activeIndex === index ? 3 : 0}
                          style={{
                            filter: activeIndex === index ? "brightness(1.1)" : "brightness(1)",
                            transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                            transformOrigin: "center",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
                              <p className="font-semibold text-foreground">{data.name}</p>
                              <p className="text-sm text-muted-foreground">{data.description}</p>
                              <p className="text-lg font-bold" style={{ color: data.color }}>
                                {data.value} analyses ({data.percentage}%)
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Légende personnalisée */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pieData.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all-smooth cursor-pointer ${
                        activeIndex === index
                          ? "border-primary bg-primary/5 scale-105"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{entry.value}</p>
                          <p className="text-sm font-medium" style={{ color: entry.color }}>
                            {entry.percentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-400 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Aucune donnée disponible</p>
                  <p className="text-sm">Effectuez des analyses pour voir les statistiques</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Évolution temporelle */}
        <Card className="hover-lift transition-all-smooth shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                <LineChartIcon className="h-6 w-6 text-white" />
              </div>
              <span>Évolution Temporelle</span>
            </CardTitle>
            <CardDescription className="text-base">
              Tendances des analyses et détections au fil du temps
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "#6b7280" }}
                    axisLine={{ stroke: "#6b7280" }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "#6b7280" }}
                    axisLine={{ stroke: "#6b7280" }}
                    label={{ value: "Nombre", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
                            <p className="font-semibold text-foreground mb-2">{label}</p>
                            {payload.map((entry, index) => (
                              <p key={index} className="text-sm" style={{ color: entry.color }}>
                                {entry.name}: {entry.value}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="analyses"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2, fill: "#ffffff" }}
                    name="Total analyses"
                    animationDuration={1500}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pneumonies"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#ef4444", strokeWidth: 2, fill: "#ffffff" }}
                    name="Pneumonies détectées"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-400 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Pas assez de données</p>
                  <p className="text-sm">Effectuez plus d'analyses pour voir l'évolution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section supplémentaire : Répartition par niveau de confiance */}
      {totalAnalyses > 0 && (
        <Card className="hover-lift transition-all-smooth shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span>Répartition par Niveau de Confiance</span>
            </CardTitle>
            <CardDescription>
              Distribution des analyses selon le niveau de confiance du modèle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Confiance Élevée", value: confidenceDistribution.high, color: "#10b981", level: "high" },
                { label: "Confiance Moyenne", value: confidenceDistribution.medium, color: "#f59e0b", level: "medium" },
                { label: "Confiance Faible", value: confidenceDistribution.low, color: "#ef4444", level: "low" },
              ].map((item, index) => (
                <div key={index} className="p-6 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{item.label}</h3>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-foreground">{item.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {totalAnalyses > 0 ? ((item.value / totalAnalyses) * 100).toFixed(1) : 0}% du total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}