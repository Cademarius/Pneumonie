# app/model.py
from torchvision import models
import torch
import torch.nn as nn

class ImprovedDenseNet121(nn.Module):
    def __init__(self, num_classes=2, dropout_rate=0.5):
        super(ImprovedDenseNet121, self).__init__()
        self.backbone = models.densenet121(pretrained=False)
        num_features = self.backbone.classifier.in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate/2),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        return self.backbone(x)

# Instancie le bon modèle
model = ImprovedDenseNet121(num_classes=2, dropout_rate=0.5)

# Charge le state_dict
model_path = "app/api/ai/densenet121_improved93_pneumonia_detection.pth"
state_dict = torch.load(model_path, map_location="cpu")
model.load_state_dict(state_dict)
model.eval()

print("[INFO] ✅ ImprovedDenseNet121 chargé avec succès !")
