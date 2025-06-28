import os
import numpy as np
from PIL import Image
import torch
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

def generate_gradcam(model, input_tensor, image_pil: Image.Image, class_id: int, save_path: str):
    """
    Génère une heatmap Grad-CAM pour une image donnée et la sauvegarde.

    Args:
        model: le modèle PyTorch
        input_tensor: tenseur d'entrée transformé
        image_pil: image d'origine (PIL)
        class_id: classe cible pour Grad-CAM
        save_path: chemin pour sauvegarder l'image résultante
    """
    # Mettre sur le bon device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    input_tensor = input_tensor.to(device)

    # Cibler la dernière couche convolutive (adapter selon le modèle)
    try:
        target_layer = model.backbone.features[-1]  # Pour ImprovedDenseNet121
    except AttributeError:
        target_layer = model.features[-1]           # Pour DenseNet121 standard

    # Initialiser GradCAM sans paramètre `device`
    cam = GradCAM(model=model, target_layers=[target_layer])

    # Générer la heatmap (1ère image du batch)
    grayscale_cam = cam(input_tensor=input_tensor, targets=None)[0]

    # Normaliser l'image d'entrée
    image_resized = image_pil.resize((256, 256)).convert("RGB")
    rgb_image = np.array(image_resized).astype(np.float32) / 255.0

    # Générer l’image superposée
    cam_image = show_cam_on_image(rgb_image, grayscale_cam, use_rgb=True)

    # Créer le dossier si nécessaire
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    # Sauvegarder l’image en BGR
    import cv2
    cv2.imwrite(save_path, cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR))
