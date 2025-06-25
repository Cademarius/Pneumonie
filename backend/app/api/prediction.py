from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from PIL import Image
import io
import time
import torch
from torchvision import transforms
from app.model import model
from sqlalchemy.orm import Session
from app.auth.routes import get_current_user
from app.auth.models import User
from app.auth import crud
from app.auth.schemas import PatientCreate
from app.database import get_db

router = APIRouter()

preprocess = transforms.Compose(
    [
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    age: int = Form(...),
    sexe: str = Form(...),
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
        print(f"Probabilities: {probs}")
        class_id = torch.argmax(probs, dim=1).item()
        confidence = probs[0, class_id].item()
        prediction_class = "PNEUMONIA" if class_id == 1 else "NORMAL"
        verdict = "positive" if prediction_class == "PNEUMONIA" else "negative"
        probability = round(confidence * 100, 2)
        conf_label = "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low"
        file_name = file.filename or f"upload_{int(time.time())}.jpg"

        # 📍 Création du patient
        patient_data = PatientCreate(nom=nom, prenom=prenom, age=age, sexe=sexe)
        patient = crud.create_patient(db, patient_data)

        # 📍 Ajout de l’analyse
        history = crud.add_analysis(
            db,
            current_user,
            file_name,
            verdict,
            probability,
            conf_label,
            patient_id=patient.id,
        )

        return {
            "id": history.id,
            "verdict": verdict,
            "probability": probability,
            "confidence": conf_label,
            "file_name": file_name,
            "patientInfo": {
                "nom": nom,
                "prenom": prenom,
                "age": age,
                "sexe": sexe,
            },
}

    except Exception as e:
        import traceback
        traceback.print_exc()   # Affiche la stack trace dans la console
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")