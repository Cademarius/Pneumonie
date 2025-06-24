# app/model.py
from torchvision import models
import torch.nn as nn
import torch

model = models.densenet121(pretrained=False)
model.classifier = nn.Linear(model.classifier.in_features, 2)

model_path = "app/api/ai/pneumonia_detection.pth"
state_dict = torch.load(model_path, map_location="cpu")
model.load_state_dict(state_dict)
model.eval()