"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Info,
  Brain,
  Stethoscope,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Cpu,
  Database,
  Settings,
  Users,
  FileText,
  Lightbulb,
  TrendingUp,
} from "lucide-react"

export default function InfoPage() {
  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentation Médicale</h1>
          <p className="text-muted-foreground">
            Guide complet d'utilisation de PneumoDetect pour les professionnels de santé
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <Info className="h-6 w-6" />
            <span>À propos de PneumoDetect</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          <p className="text-base leading-relaxed">
            PneumoDetect est un système d'aide au diagnostic médical basé sur l'intelligence artificielle, conçu pour
            assister les radiologues et médecins dans la détection de pneumonies sur les radiographies thoraciques. Ce
            système utilise des algorithmes de deep learning avancés pour analyser les images médicales et fournir une
            évaluation objective des signes radiologiques de pneumonie.
          </p>
        </CardContent>
      </Card>

      {/* Fonctionnement du modèle IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover-lift transition-all-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Architecture du Modèle IA</span>
            </CardTitle>
            <CardDescription>Technologie et méthodologie utilisées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Cpu className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Réseau de Neurones Convolutionnel</h4>
                  <p className="text-sm text-muted-foreground">
                    Architecture ResNet-50 modifiée, optimisée pour l'analyse d'images médicales
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Database className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Dataset d'Entraînement</h4>
                  <p className="text-sm text-muted-foreground">
                    Plus de 100,000 radiographies annotées par des radiologues certifiés
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Sensibilité: 94.2% | Spécificité: 96.8% | Précision globale: 95.7%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-600" />
              <span>Processus d'Analyse</span>
            </CardTitle>
            <CardDescription>Étapes de traitement des images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Préprocessing",
                  description: "Normalisation, redimensionnement et amélioration du contraste",
                },
                {
                  step: "2",
                  title: "Extraction de caractéristiques",
                  description: "Identification des patterns radiologiques significatifs",
                },
                {
                  step: "3",
                  title: "Classification",
                  description: "Évaluation probabiliste de la présence de pneumonie",
                },
                {
                  step: "4",
                  title: "Post-traitement",
                  description: "Calcul du niveau de confiance et génération du rapport",
                },
              ].map((process, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {process.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{process.title}</h4>
                    <p className="text-sm text-muted-foreground">{process.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guide d'utilisation */}
      <Card className="hover-lift transition-all-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span>Guide d'Utilisation Clinique</span>
          </CardTitle>
          <CardDescription>Recommandations pour une utilisation optimale en pratique médicale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Indications d'Usage</span>
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Aide au diagnostic de pneumonie communautaire</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Screening de masse en période épidémique</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Support pour médecins non-radiologues</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Télémédecine et consultations à distance</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Qualité des Images</span>
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Radiographie PA ou AP de face</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Résolution minimale: 512x512 pixels</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Formats supportés: JPEG, PNG, DICOM</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Contraste et exposition appropriés</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interprétation des résultats */}
      <Card className="hover-lift transition-all-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>Interprétation des Résultats</span>
          </CardTitle>
          <CardDescription>Comment interpréter les scores et niveaux de confiance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Score de Probabilité</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                  <span className="text-sm">0-30%</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Très faible risque
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                  <span className="text-sm">31-60%</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Risque modéré
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                  <span className="text-sm">61-100%</span>
                  <Badge variant="destructive">Risque élevé</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Niveau de Confiance</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                  <span className="text-sm">Élevée</span>
                  <span className="text-xs text-muted-foreground">Fiabilité &gt; 95%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                  <span className="text-sm">Moyenne</span>
                  <span className="text-xs text-muted-foreground">Fiabilité 85-95%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-950/20 rounded">
                  <span className="text-sm">Faible</span>
                  <span className="text-xs text-muted-foreground">Fiabilité &lt; 85%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Recommandations</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Confiance élevée: Résultat fiable pour aide au diagnostic</p>
                <p>• Confiance moyenne: Corrélation clinique recommandée</p>
                <p>• Confiance faible: Expertise radiologique nécessaire</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limitations et précautions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover-lift transition-all-smooth border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              <span>Limitations Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-amber-800 dark:text-amber-200">
            <div className="space-y-2 text-sm">
              <p>• Ne remplace pas l'expertise médicale humaine</p>
              <p>• Performances variables selon la qualité d'image</p>
              <p>• Non validé pour les pneumonies atypiques</p>
              <p>• Limité aux radiographies thoraciques de face</p>
              <p>• Peut présenter des faux positifs/négatifs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all-smooth border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Shield className="h-5 w-5" />
              <span>Bonnes Pratiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-green-800 dark:text-green-200">
            <div className="space-y-2 text-sm">
              <p>• Toujours corréler avec la clinique</p>
              <p>• Vérifier la qualité de l'image avant analyse</p>
              <p>• Documenter l'utilisation de l'IA dans le dossier</p>
              <p>• Former le personnel à l'interprétation</p>
              <p>• Maintenir une supervision médicale</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support et contact */}
      <Card className="hover-lift transition-all-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Support Technique et Médical</span>
          </CardTitle>
          <CardDescription>Assistance et ressources pour les utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Support Technique</h4>
              <p className="text-sm text-muted-foreground">support@pneumodetect.com</p>
              <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Conseil Médical</h4>
              <p className="text-sm text-muted-foreground">medical@pneumodetect.com</p>
              <p className="text-sm text-muted-foreground">Dr. Marie Dubois, Radiologue</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Formation</h4>
              <p className="text-sm text-muted-foreground">formation@pneumodetect.com</p>
              <p className="text-sm text-muted-foreground">Webinaires mensuels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations légales */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Dispositif Médical de Classe IIa</strong> - Marquage CE conforme à la directive 93/42/CEE. Fabricant:
          PneumoDetect SAS, 123 Avenue de la Santé, 75001 Paris, France. Version du modèle: 2.1.0 (Décembre 2024).
          Dernière mise à jour de la documentation: {new Date().toLocaleDateString("fr-FR")}.
        </AlertDescription>
      </Alert>
    </div>
  )
}
