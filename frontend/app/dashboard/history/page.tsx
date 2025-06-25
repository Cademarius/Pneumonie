"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import jsPDF from "jspdf"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  FileText,
  ImageIcon,
  Clock,
  Target,
  TrendingUp,
  FileDown,
  User,
  Users,
} from "lucide-react"

interface PatientInfo {
  nom: string
  prenom: string
  age?: number
  sexe?: string
}

interface AnalysisRecord {
  id: string
  verdict: "positive" | "negative"
  probability: number
  confidence: "high" | "medium" | "low"
  timestamp: Date
  fileName: string
  patient: PatientInfo
  imageUrl?: string
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterVerdict, setFilterVerdict] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includeDate: true,
    includePatientName: true,
    includeFileName: true,
    includeVerdict: true,
    includeProbability: true,
    includeConfidence: true,
    dateRange: "all" as "all" | "week" | "month" | "year",
  })

  const itemsPerPage = 10

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('Pas de token, redirigez vers login ?')
      return
    }

    fetch('http://127.0.0.1:8000/history/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur: ${res.statusText}`)
        return res.json()
      })
      .then((historyData: any[]) => {
        const processedHistory: AnalysisRecord[] = historyData.map((item) => ({
          id: item.id.toString(),
          fileName: item.file_name,
          verdict: item.verdict,
          probability: item.probability,
          confidence: item.confidence,
          timestamp: new Date(item.timestamp),
          patient: {
            nom: item.patient?.nom || 'Non renseigné',
            prenom: item.patient?.prenom || 'Non renseigné',
            age: item.patient?.age,
            sexe: item.patient?.sexe,
          },
          imageUrl: `http://127.0.0.1:8000/uploads/${item.file_name}`,
        }))
        setAnalyses(processedHistory)
        setFilteredAnalyses(processedHistory)
      })
      .catch((err) => {
        console.error(err)
        // Tu pourras afficher un message d'erreur à l'utilisateur ici
      })
  }, [])

  useEffect(() => {
    // Filtrer les analyses
    let filtered = analyses

    if (searchTerm) {
      filtered = filtered.filter((analysis) => 
        analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${analysis.patient.prenom} ${analysis.patient.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterVerdict !== "all") {
      filtered = filtered.filter((analysis) => analysis.verdict === filterVerdict)
    }

    setFilteredAnalyses(filtered)
    setCurrentPage(1)
  }, [searchTerm, filterVerdict, analyses])

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAnalyses = filteredAnalyses.slice(startIndex, endIndex)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getPatientFullName = (patient: PatientInfo) => {
    return `${patient.prenom} ${patient.nom}`
  }

  const getVerdictBadge = (verdict: string) => {
    return verdict === "positive" ? (
      <Badge variant="destructive" className="animate-fade-in">
        <Target className="h-3 w-3 mr-1" />
        Pneumonie
      </Badge>
    ) : (
      <Badge variant="secondary" className="animate-fade-in">
        Normal
      </Badge>
    )
  }

  const getConfidenceBadge = (confidence: string) => {
    const variant = confidence === "high" ? "default" : confidence === "medium" ? "secondary" : "outline"
    const label = confidence === "high" ? "Élevée" : confidence === "medium" ? "Moyenne" : "Faible"
    return (
      <Badge variant={variant} className="animate-fade-in">
        {label}
      </Badge>
    )
  }

  const handleViewAnalysis = (analysis: AnalysisRecord) => {
    setSelectedAnalysis(analysis)
    setIsViewDialogOpen(true)
  }

  const handleDownloadAnalysis = (analysis: AnalysisRecord) => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Rapport d'analyse radiographique", 14, 22)

    doc.setFontSize(12)
    doc.text(`Patient : ${getPatientFullName(analysis.patient)}`, 14, 40)
    if (analysis.patient.age) {
      doc.text(`Âge : ${analysis.patient.age} ans`, 14, 50)
    }
    if (analysis.patient.sexe) {
      doc.text(`Sexe : ${analysis.patient.sexe}`, 14, 60)
    }
    doc.text(`Nom du fichier : ${analysis.fileName}`, 14, 70)
    doc.text(`Date : ${formatDate(analysis.timestamp)}`, 14, 80)
    doc.text(`Résultat : ${analysis.verdict === "positive" ? "Pneumonie détectée" : "Normal"}`, 14, 90)
    doc.text(`Probabilité : ${analysis.probability}%`, 14, 100)
    const confidenceLabel =
      analysis.confidence === "high" ? "Élevée" : analysis.confidence === "medium" ? "Moyenne" : "Faible"
    doc.text(`Niveau de confiance : ${confidenceLabel}`, 14, 110)

    doc.save(`rapport-${analysis.patient.nom}-${analysis.patient.prenom}-${Date.now()}.pdf`)
  }

  const handleExportCSV = () => {
    let dataToExport = filteredAnalyses

    // Filtrer par date si nécessaire
    if (exportOptions.dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (exportOptions.dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      dataToExport = dataToExport.filter((analysis) => analysis.timestamp >= cutoffDate)
    }

    // Créer les en-têtes CSV
    const headers = []
    if (exportOptions.includeDate) headers.push("Date")
    if (exportOptions.includePatientName) headers.push("Patient")
    if (exportOptions.includeFileName) headers.push("Fichier")
    if (exportOptions.includeVerdict) headers.push("Résultat")
    if (exportOptions.includeProbability) headers.push("Probabilité")
    if (exportOptions.includeConfidence) headers.push("Confiance")

    // Créer les données CSV
    const csvData = [
      headers.join(","),
      ...dataToExport.map((analysis) => {
        const row = []
        if (exportOptions.includeDate) row.push(`"${formatDate(analysis.timestamp)}"`)
        if (exportOptions.includePatientName) row.push(`"${getPatientFullName(analysis.patient)}"`)
        if (exportOptions.includeFileName) row.push(`"${analysis.fileName}"`)
        if (exportOptions.includeVerdict) row.push(`"${analysis.verdict === "positive" ? "Pneumonie" : "Normal"}"`)
        if (exportOptions.includeProbability) row.push(`"${analysis.probability}%"`)
        if (exportOptions.includeConfidence) row.push(`"${analysis.confidence}"`)
        return row.join(",")
      }),
    ].join("\n")

    // Télécharger le fichier CSV
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `historique-analyses-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setIsExportDialogOpen(false)
  }

  // Calculer les statistiques par patient
  const uniquePatients = analyses.reduce((acc, analysis) => {
    const patientKey = `${analysis.patient.nom}_${analysis.patient.prenom}`
    if (!acc.has(patientKey)) {
      acc.add(patientKey)
    }
    return acc
  }, new Set()).size

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Historique des Analyses</h1>
            <p className="text-muted-foreground">Consultez et gérez vos analyses précédentes par patient</p>
          </div>
        </div>
        <Button onClick={() => setIsExportDialogOpen(true)} className="hover-lift">
          <FileDown className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { icon: History, label: "Total analyses", value: analyses.length, color: "text-blue-600" },
          { icon: Users, label: "Patients uniques", value: uniquePatients, color: "text-indigo-600" },
          {
            icon: Calendar,
            label: "Normales",
            value: analyses.filter((a) => a.verdict === "negative").length,
            color: "text-green-600",
          },
          {
            icon: Target,
            label: "Pneumonies",
            value: analyses.filter((a) => a.verdict === "positive").length,
            color: "text-red-600",
          },
          {
            icon: TrendingUp,
            label: "Taux détection",
            value: `${analyses.length > 0 ? Math.round((analyses.filter((a) => a.verdict === "positive").length / analyses.length) * 100) : 0}%`,
            color: "text-purple-600",
          },
        ].map((stat, index) => (
          <Card key={index} className="hover-lift transition-all-smooth">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres et recherche */}
      <Card className="hover-lift transition-all-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres et recherche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom de patient ou fichier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all-smooth"
                />
              </div>
            </div>

            <Select value={filterVerdict} onValueChange={setFilterVerdict}>
              <SelectTrigger className="w-full md:w-48 transition-all-smooth">
                <SelectValue placeholder="Filtrer par résultat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les résultats</SelectItem>
                <SelectItem value="positive">Pneumonie détectée</SelectItem>
                <SelectItem value="negative">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des analyses */}
      <Card className="hover-lift transition-all-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Analyses ({filteredAnalyses.length})</span>
          </CardTitle>
          <CardDescription>Liste de toutes vos analyses de radiographies par patient</CardDescription>
        </CardHeader>
        <CardContent>
          {currentAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg">
                {analyses.length === 0 ? "Aucune analyse effectuée" : "Aucun résultat trouvé"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Date & Heure</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Patient</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Résultat</TableHead>
                      <TableHead className="font-semibold">Confiance</TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4" />
                          <span>Image</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAnalyses.map((analysis) => (
                      <TableRow key={analysis.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{formatDate(analysis.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {getPatientFullName(analysis.patient)}
                            </span>
                            {analysis.patient.age && (
                              <span className="text-sm text-muted-foreground">
                                {analysis.patient.age} ans
                                {analysis.patient.sexe && ` • ${analysis.patient.sexe}`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getVerdictBadge(analysis.verdict)}</TableCell>
                        <TableCell>{getConfidenceBadge(analysis.confidence)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 rounded border overflow-hidden bg-muted">
                              <img
                                src={analysis.imageUrl}
                                alt="Aperçu"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground">📷</div>';
                                }}
                              />
                            </div>
                            <div className="max-w-24 truncate text-sm text-muted-foreground" title={analysis.fileName}>
                              {analysis.fileName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAnalysis(analysis)}
                              className="hover-lift transition-all-smooth"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAnalysis(analysis)}
                              className="hover-lift transition-all-smooth"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAnalyses.length)} sur{" "}
                    {filteredAnalyses.length} résultats
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="transition-all-smooth"
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="transition-all-smooth"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de vue détaillée */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Détails de l'analyse</span>
            </DialogTitle>
            <DialogDescription>Informations complètes sur l'analyse sélectionnée</DialogDescription>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Image avec gestion d'erreur améliorée */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={selectedAnalysis.imageUrl}
                    alt="Radiographie analysée"
                    className="max-w-full h-auto rounded-lg border shadow-lg max-h-96 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=300&width=400&text=Image+non+disponible";
                    }}
                  />
                  <div className="absolute top-2 right-2">{getVerdictBadge(selectedAnalysis.verdict)}</div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Informations Patient</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom complet:</span>
                      <span className="font-medium text-foreground">
                        {getPatientFullName(selectedAnalysis.patient)}
                      </span>
                    </div>
                    {selectedAnalysis.patient.age && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Âge:</span>
                        <span className="font-medium text-foreground">{selectedAnalysis.patient.age} ans</span>
                      </div>
                    )}
                    {selectedAnalysis.patient.sexe && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sexe:</span>
                        <span className="font-medium text-foreground">{selectedAnalysis.patient.sexe}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date d'analyse:</span>
                      <span className="font-medium text-foreground">{formatDate(selectedAnalysis.timestamp)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Résultats de l'IA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Diagnostic:</span>
                      {getVerdictBadge(selectedAnalysis.verdict)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Probabilité:</span>
                      <span className="font-bold text-2xl text-foreground">{selectedAnalysis.probability}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Niveau de confiance:</span>
                      {getConfidenceBadge(selectedAnalysis.confidence)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom du fichier:</span>
                      <span className="font-mono text-sm text-foreground">{selectedAnalysis.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID d'analyse:</span>
                      <span className="font-mono text-sm text-foreground">{selectedAnalysis.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadAnalysis(selectedAnalysis)}
                  className="hover-lift"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le rapport
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'export CSV */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileDown className="h-5 w-5" />
              <span>Exporter l'historique en CSV</span>
            </DialogTitle>
            <DialogDescription>Sélectionnez les données à inclure dans l'export</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Colonnes à inclure */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Colonnes à inclure</Label>
              <div className="space-y-3">
                {[
                  { key: "includeDate", label: "Date et heure" },
                  { key: "includePatientName", label: "Nom du patient" },
                  { key: "includeFileName", label: "Nom du fichier" },
                  { key: "includeVerdict", label: "Résultat du diagnostic" },
                  { key: "includeProbability", label: "Probabilité" },
                  { key: "includeConfidence", label: "Niveau de confiance" },
                ].map((option) => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.key}
                      checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                      onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, [option.key]: checked }))}
                    />
                    <Label htmlFor={option.key} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Période */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Période</Label>
              <Select
                value={exportOptions.dateRange}
                onValueChange={(value) => setExportOptions((prev) => ({ ...prev, dateRange: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les analyses</SelectItem>
                  <SelectItem value="week">Dernière semaine</SelectItem>
                  <SelectItem value="month">Dernier mois</SelectItem>
                  <SelectItem value="year">Dernière année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleExportCSV} className="hover-lift">
                <FileDown className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}