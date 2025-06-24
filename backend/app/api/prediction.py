from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from PIL import Image
import io
import torch
from torchvision import transforms
from app.model import model
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.routes import get_current_user
from app.auth.models import User
from app.auth import crud

router = APIRouter()

preprocess = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],[0.229, 0.224, 0.225]),
])

@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        input_tensor = preprocess(image).unsqueeze(0)

        with torch.no_grad():
            output = model(input_tensor)

        probs = torch.softmax(output, dim=1)
        class_id = torch.argmax(probs, dim=1).item()
        confidence = probs[0, class_id].item()
        prediction_class = "PNEUMONIA" if class_id == 1 else "NORMAL"

        verdict = "positive" if prediction_class == "PNEUMONIA" else "negative"
        probability = round(confidence * 100, 2)
        conf_label = "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low"

        # Générer un nom de fichier (ou récupérer depuis file.filename)
        file_name = file.filename or f"upload_{int(time.time())}.jpg"

        # Enregistrer dans la DB
        history = crud.add_analysis(db, current_user, file_name, verdict, probability, conf_label)

        return {
            "id": history.id,
            "verdict": verdict,
            "probability": probability,
            "confidence": conf_label,
            "file_name": file_name,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la prédiction: {str(e)}"
        )
