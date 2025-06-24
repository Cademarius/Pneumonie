"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Upload, FileImage, Brain, Download, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

interface AnalysisResult {
  verdict: "positive" | "negative"
  probability: number
  confidence: "high" | "medium" | "low"
  timestamp: Date
  fileName: string
}

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setAnalysisResult(null)
    }
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
  const handleAnalyze = async () => {
  if (!uploadedFile) return;

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
      verdict: data.verdict,
      probability: data.probability,
      confidence: data.confidence,
      timestamp: new Date(),
      fileName: uploadedFile.name,
    };
    setAnalysisResult(result);

    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]')
    history.unshift(result)
    localStorage.setItem('analysisHistory', JSON.stringify(history))
  } catch (error) {
    console.error(error)
    alert("Erreur pendant l'analyse, consultez la console pour plus de détails.")
  } finally {
    setIsAnalyzing(false)
  }
}



    


  const handleExportPDF = () => {
    // Simulation de l'export PDF
    alert("Export PDF en cours de développement...")
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouvelle Analyse</h1>
            <p className="text-gray-600">Analysez une radiographie pour détecter une pneumonie</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone d'upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload de radiographie</span>
            </CardTitle>
            <CardDescription>Glissez-déposez votre image ou cliquez pour sélectionner</CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600">Déposez l'image ici...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Glissez-déposez une radiographie ici</p>
                    <p className="text-sm text-gray-500">Formats supportés: JPEG, PNG, DICOM</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg?height=256&width=400"}
                    alt="Radiographie uploadée"
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" onClick={resetAnalysis}>
                    Changer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zone d'analyse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Analyse IA</span>
            </CardTitle>
            <CardDescription>Résultats de l'analyse de pneumonie</CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Uploadez une image pour commencer l'analyse</p>
              </div>
            ) : !analysisResult && !isAnalyzing ? (
              <div className="text-center py-8">
                <Button onClick={handleAnalyze} size="lg" className="mb-4">
                  <Brain className="h-5 w-5 mr-2" />
                  Analyser la radiographie
                </Button>
                <p className="text-sm text-gray-500">L'analyse prend généralement 2-3 secondes</p>
              </div>
            ) : isAnalyzing ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="font-medium mb-2">Analyse en cours...</p>
                <p className="text-sm text-gray-500">L'IA analyse votre radiographie</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6">
                {/* Verdict principal */}
                <Alert
                  className={
                    analysisResult.verdict === "positive" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                  }
                >
                  {analysisResult.verdict === "positive" ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription
                    className={analysisResult.verdict === "positive" ? "text-red-800" : "text-green-800"}
                  >
                    <span className="font-semibold">
                      {analysisResult.verdict === "positive" ? "Pneumonie détectée" : "Pas de pneumonie détectée"}
                    </span>
                  </AlertDescription>
                </Alert>

                {/* Détails */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{analysisResult.probability}%</p>
                    <p className="text-sm text-gray-600">Probabilité</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Badge
                      variant={
                        analysisResult.confidence === "high"
                          ? "default"
                          : analysisResult.confidence === "medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {analysisResult.confidence === "high"
                        ? "Élevée"
                        : analysisResult.confidence === "medium"
                          ? "Moyenne"
                          : "Faible"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Confiance</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter PDF
                  </Button>
                  <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                    Nouvelle analyse
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
