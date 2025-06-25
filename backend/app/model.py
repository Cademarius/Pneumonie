# app/model.py
from torchvision import models
import torch.nn as nn
import torch

# Crée le modèle DenseNet121
model = models.densenet121(pretrained=False)
model.classifier = nn.Linear(model.classifier.in_features, 2)

# Charge le state_dict
model_path = "app/api/ai/densenet121_improved93_pneumonia_detection.pth"
state_dict = torch.load(model_path, map_location="cpu")