"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Upload, FileImage, Brain, Download, CheckCircle, AlertTriangle, Loader2, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select as ShadSelect, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem } from "@/components/ui/select"

interface AnalysisResult {
  id: number;  // 🆕 ajout de l'id ici
  verdict: "positive" | "negative";
  timestamp: Date;
  fileName: string;
  probability?: number;   // si tu veux sauvegarder aussi ces champs
  confidence?: string;
  patientInfo: {
    nom: string;
    prenom: string;
    age: string;
    sexe: string;
  };
}

interface PatientInfo {
  nom: string
  prenom: string
  age: string
  sexe: string
}

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionValue, setCorrectionValue] = useState<string>("")
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    nom: "",
    prenom: "",
    age: "",
    sexe: ""
  })

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setAnalysisResult(null)
    }
  }

   const handleCorrectionSubmit = () => {
    if (!correctionValue) return
    // Ici, vous pouvez envoyer la correction à votre backend ou l’enregistrer localement
    alert(`Correction envoyée : ${correctionValue}`)
    setShowCorrectionModal(false)
    setCorrectionValue("")
  }


  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isPatientInfoComplete = () => {
    return patientInfo.nom && patientInfo.prenom && patientInfo.age && patientInfo.sexe
  }

  const canAnalyze = () => {
    return uploadedFile && isPatientInfoComplete()
  }
const handleAnalyze = async () => {
  if (!uploadedFile || !isPatientInfoComplete()) return;

  setIsAnalyzing(true);

  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Vous devez être connecté pour effectuer une analyse')
      setIsAnalyzing(false)
      return
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);
formData.append('nom', patientInfo.nom);
formData.append('prenom', patientInfo.prenom);
formData.append('age', patientInfo.age.toString()); // age doit être string ici
formData.append('sexe', patientInfo.sexe);

    const response = await fetch('http://127.0.0.1:8000/predictions/predict', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status} ${response.statusText}`)
    }

    const data = await response.json();

    const result: AnalysisResult = {
      id: data.id,
      verdict: data.verdict,
      probability: data.probability,
      confidence: data.confidence,
      timestamp: new Date(),
      fileName: data.file_name,
      patientInfo: { ...patientInfo }
    }

    setAnalysisResult(result);

    // On sauvegarde dans l’historique local
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]')
    history.unshift(result)
    localStorage.setItem('analysisHistory', JSON.stringify(history))
  } catch (error) {
    console.error(error)
    alert("Erreur pendant l'analyse, consultez la console pour plus de détails.")
  } finally {
    setIsAnalyzing(false)
  }
};


  const handleExportPDF = () => {
    alert("Export PDF en cours de développement...")
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setPatientInfo({
      nom: "",
      prenom: "",
      age: "",
      sexe: ""
    })
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analyse Radiologique</h1>
            <p className="text-sm text-muted-foreground">Détection automatique de pneumonie par IA</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            
            {/* Colonne gauche - Upload et Informations Patient */}
            <div className="space-y-6">
              {/* Zone d'upload */}
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <span>Radiographie</span>
                  </CardTitle>
                  <CardDescription>Importez l'image à analyser</CardDescription>
                </CardHeader>
                <CardContent>
                  {!uploadedFile ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                        isDragActive ? "border-primary bg-primary/10 scale-105" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => document.getElementById("file-input")?.click()}
                    >
                      <input id="file-input" type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                      <FileImage className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      {isDragActive ? (
                        <p className="text-primary font-medium">Déposez l'image ici</p>
                      ) : (
                        <div>
                          <p className="text-foreground font-medium mb-1">Glissez-déposez ou cliquez</p>
                          <p className="text-xs text-muted-foreground">JPEG, PNG, DICOM • Max 10MB</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative bg-muted rounded-lg overflow-hidden">
                        <img
                          src={previewUrl || "/placeholder.svg?height=200&width=300"}
                          alt="Radiographie"
                          className="w-full h-48 object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={resetAnalysis}>
                          Changer
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations Patient - Formulaire compact */}
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <User className="h-5 w-5 text-green-600" />
                    <span>Informations Patient</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nom" className="text-xs font-medium text-foreground">Nom</Label>
                      <Input
                        id="nom"
                        value={patientInfo.nom}
                        onChange={(e) => handlePatientInfoChange('nom', e.target.value)}
                        placeholder="Nom"
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prenom" className="text-xs font-medium text-foreground">Prénom</Label>
                      <Input
                        id="prenom"
                        value={patientInfo.prenom}
                        onChange={(e) => handlePatientInfoChange('prenom', e.target.value)}
                        placeholder="Prénom"
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age" className="text-xs font-medium text-foreground">Âge</Label>
                      <Input
                        id="age"
                        type="number"
                        value={patientInfo.age}
                        onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                        placeholder="Âge"
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sexe" className="text-xs font-medium text-foreground">Sexe</Label>
                      <Select value={patientInfo.sexe} onValueChange={(value) => handlePatientInfoChange('sexe', value)}>
                        <SelectTrigger className="mt-1 h-9">
                          <SelectValue placeholder="Sexe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculin">Masculin</SelectItem>
                          <SelectItem value="feminin">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Bouton d'analyse */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={!canAnalyze() || isAnalyzing}
                      className="w-full h-10 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyser la radiographie
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite - Résultats */}
            <div>
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>Résultats d'Analyse</span>
                  </CardTitle>
                  <CardDescription>Diagnostic IA et recommandations</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)]">
                  {!canAnalyze() ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Brain className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Prêt pour l'analyse</h3>
                      <p className="text-sm text-muted-foreground mb-1">1. Importez une radiographie</p>
                      <p className="text-sm text-muted-foreground">2. Complétez les informations patient</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Analyse en cours</h3>
                      <p className="text-sm text-muted-foreground">L'IA analyse votre radiographie...</p>
                      <div className="w-64 bg-muted rounded-full h-2 mt-4">
                        <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="h-full flex flex-col">
                      {/* En-tête patient */}

                      {/* Résultat principal */}
                      <div className="flex-1">
                        <Alert className={`mb-6 border-2 ${
                          analysisResult.verdict === "positive" 
                            ? "border-red-200 bg-red-50" 
                            : "border-green-200 bg-green-50"
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              analysisResult.verdict === "positive" ? "bg-red-100" : "bg-green-100"
                            }`}>
                              {analysisResult.verdict === "positive" ? (
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                              ) : (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              )}
                            </div>
                            <div>
                              <AlertDescription className={`text-lg font-semibold ${
                                analysisResult.verdict === "positive" ? "text-red-800" : "text-green-800"
                              }`}>
                                {analysisResult.verdict === "positive" ? "Pneumonie Détectée" : "Poumons Sains"}
                              </AlertDescription>
                              <p className={`text-sm mt-1 ${
                                analysisResult.verdict === "positive" ? "text-red-700" : "text-green-700"
                              }`}>
                                {analysisResult.verdict === "positive" 
                                  ? "Des signes de pneumonie ont été détectés"
                                  : "Aucun signe de pneumonie détecté"
                                }
                              </p>
                            </div>
                          </div>
                        </Alert>

                        <div className="flex justify-center mb-6">
                          <img
                            src={previewUrl || "/placeholder.svg?height=300&width=500"}
                            alt="Radiographie analysée"
                            className="w-64 h-48 object-contain rounded border"
                          />
                        </div>

                      </div>

                      {/* Actions */}
                       <div className="flex space-x-3 pt-4 border-t border-border">
                        <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Exporter PDF
                        </Button>
                        <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                          Nouvelle analyse
                        </Button>
                        {/* Bouton Correction */}
                        <Button onClick={() => setShowCorrectionModal(true)} variant="outline" className="flex-1">
                          Correction
                        </Button>
                      </div>
                      <Dialog open={showCorrectionModal} onOpenChange={setShowCorrectionModal}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Correction du diagnostic</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <ShadSelect value={correctionValue} onValueChange={setCorrectionValue}>
                              <ShadSelectTrigger className="w-full">
                                <ShadSelectValue placeholder="Sélectionnez le diagnostic correct" />
                              </ShadSelectTrigger>
                              <ShadSelectContent>
                                <ShadSelectItem value="sain">Sain</ShadSelectItem>
                                <ShadSelectItem value="pneumonie_virale">Pneumonie virale</ShadSelectItem>
                                <ShadSelectItem value="pneumonie_bacterienne">Pneumonie bactérienne</ShadSelectItem>
                              </ShadSelectContent>
                            </ShadSelect>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleCorrectionSubmit}
                              disabled={!correctionValue}
                            >
                              Envoyer la correction
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}