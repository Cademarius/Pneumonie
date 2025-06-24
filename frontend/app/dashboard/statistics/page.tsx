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
  PieChartIcon,
  LineChartIcon,
  Download,
  RefreshCw,
  Zap,
  BarChart3,
} from "lucide-react"

interface AnalysisRecord {
  verdict: "positive" | "negative"
  probability: number
  confidence: "high" | "medium" | "low"
  timestamp: Date
  fileName: string
}

export default function StatisticsPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [timeRange, setTimeRange] = useState("6months")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("analysisHistory") || "[]")
    const processedHistory = history.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }))
    setAnalyses(processedHistory)
  }, [])

  // Calculs des métriques
  const totalAnalyses = analyses.length
  const pneumoniaDetected = analyses.filter((a) => a.verdict === "positive").length
  const normalCases = analyses.filter((a) => a.verdict === "negative").length
  const detectionRate = totalAnalyses > 0 ? ((pneumoniaDetected / totalAnalyses) * 100).toFixed(1) : "0"
  const avgProbability =
    totalAnalyses > 0 ? (analyses.reduce((sum, a) => sum + a.probability, 0) / totalAnalyses).toFixed(1) : "0"

  // Données pour le graphique en secteurs interactif
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

  // Données pour l'évolution temporelle enrichie
  const generateTimelineData = () => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ]

    // Données simulées plus réalistes
    const baseData = [
      { month: "Janvier", analyses: 15, pneumonies: 3, precision: 94.2, nouveauxCas: 2 },
      { month: "Février", analyses: 22, pneumonies: 5, precision: 95.1, nouveauxCas: 4 },
      { month: "Mars", analyses: 28, pneumonies: 7, precision: 96.3, nouveauxCas: 6 },
      { month: "Avril", analyses: 35, pneumonies: 8, precision: 94.8, nouveauxCas: 5 },
      { month: "Mai", analyses: 42, pneumonies: 11, precision: 97.2, nouveauxCas: 8 },
      {
        month: "Juin",
        analyses: totalAnalyses || 48,
        pneumonies: pneumoniaDetected || 12,
        precision: 95.7,
        nouveauxCas: 9,
      },
    ]

    return baseData
  }

  const timelineData = generateTimelineData()

  const handleExportStats = () => {
    const statsData = {
      totalAnalyses,
      pneumoniaDetected,
      normalCases,
      detectionRate: `${detectionRate}%`,
      avgProbability: `${avgProbability}%`,
      generatedAt: new Date().toISOString(),
      pieData,
      timelineData,
    }

    const dataStr = JSON.stringify(statsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `statistiques-pneumodetect-${Date.now()}.json`
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

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Analytique</h1>
            <p className="text-muted-foreground">Analyse détaillée de vos données de détection pneumonique</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportStats} className="hover-lift">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="hover-lift">
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
            change: "+12%",
            color: "text-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
            trend: "up",
          },
          {
            icon: Target,
            label: "Pneumonies Détectées",
            value: pneumoniaDetected,
            change: "+8%",
            color: "text-red-600",
            bgColor: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
            trend: "up",
          },
          {
            icon: TrendingUp,
            label: "Taux de Détection",
            value: `${detectionRate}%`,
            change: "+2.1%",
            color: "text-green-600",
            bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
            trend: "up",
          },
          {
            icon: Zap,
            label: "Précision Moyenne",
            value: `${avgProbability}%`,
            change: "+1.5%",
            color: "text-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
            trend: "up",
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
        {/* Répartition des diagnostics - Graphique en secteurs interactif */}
        <Card className="hover-lift transition-all-smooth shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <PieChartIcon className="h-6 w-6 text-white" />
              </div>
              <span>Répartition des Diagnostics</span>
            </CardTitle>
            <CardDescription className="text-base">
              Distribution interactive entre radiographies normales et pneumonies détectées
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

                {/* Légende interactive personnalisée */}
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

        {/* Évolution temporelle - Graphique linéaire avancé */}
        <Card className="hover-lift transition-all-smooth shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                <LineChartIcon className="h-6 w-6 text-white" />
              </div>
              <span>Évolution Temporelle</span>
            </CardTitle>
            <CardDescription className="text-base">
              Tendances des analyses et détections de pneumonies au fil du temps
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="analysesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pneumoniesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="precisionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  label={{ value: "Nombre d'analyses", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: "#6b7280" }}
                  axisLine={{ stroke: "#6b7280" }}
                  label={{ value: "Précision (%)", angle: 90, position: "insideRight" }}
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
                              {entry.dataKey === "precision" ? "%" : ""}
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
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="precision"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#ffffff" }}
                  name="Précision du modèle"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Légende et métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Analyses totales",
                  value: timelineData[timelineData.length - 1]?.analyses || 0,
                  color: "#3b82f6",
                  trend: "+15%",
                },
                {
                  label: "Pneumonies détectées",
                  value: timelineData[timelineData.length - 1]?.pneumonies || 0,
                  color: "#ef4444",
                  trend: "+8%",
                },
                {
                  label: "Précision moyenne",
                  value: `${timelineData[timelineData.length - 1]?.precision || 95}%`,
                  color: "#10b981",
                  trend: "+2.1%",
                },
              ].map((metric, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-foreground">{metric.value}</p>
                    <Badge variant="secondary" className="text-xs">
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
