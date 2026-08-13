$base = "http://localhost:8080/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== Seeding Medical Records ===" -ForegroundColor Cyan

$records = @(
  @{ diagnosis = "Hypertension Stage 2"; treatment = "ACE inhibitor therapy, lifestyle modification"; prescription = "Enalapril 10mg daily, Amlodipine 5mg daily"; recordDate = "2026-08-13"; patientId = 2; doctorId = 1 },
  @{ diagnosis = "Migraine with aura"; treatment = "Preventive medication, trigger avoidance"; prescription = "Sumatriptan 50mg as needed, Propranolol 40mg daily"; recordDate = "2026-08-13"; patientId = 4; doctorId = 2 },
  @{ diagnosis = "Lumbar disc herniation L4-L5"; treatment = "Physical therapy, epidural steroid injection"; prescription = "Ibuprofen 400mg TID, Methocarbamol 500mg QID"; recordDate = "2026-08-13"; patientId = 6; doctorId = 3 },
  @{ diagnosis = "Acute bronchitis"; treatment = "Supportive care, rest, hydration"; prescription = "Amoxicillin 500mg TID x7 days, Guaifenesin syrup"; recordDate = "2026-08-12"; patientId = 3; doctorId = 8 },
  @{ diagnosis = "Type 2 Diabetes Mellitus"; treatment = "Metformin therapy, dietary counseling"; prescription = "Metformin 500mg BID, Glimepiride 2mg daily"; recordDate = "2026-08-12"; patientId = 5; doctorId = 14 },
  @{ diagnosis = "Atopic dermatitis, moderate"; treatment = "Topical corticosteroids, moisturizing regimen"; prescription = "Betamethasone 0.1% cream BID, Cetirizine 10mg daily"; recordDate = "2026-08-11"; patientId = 7; doctorId = 5 },
  @{ diagnosis = "Allergic conjunctivitis"; treatment = "Antihistamine eye drops, cold compress"; prescription = "Olopatadine 0.1% eye drops BID, Artificial tears PRN"; recordDate = "2026-08-11"; patientId = 8; doctorId = 6 },
  @{ diagnosis = "Chronic sinusitis"; treatment = "Nasal irrigation, antibiotics course"; prescription = "Amoxicillin-Clavulanate 875mg BID x14 days, Fluticasone nasal spray"; recordDate = "2026-08-10"; patientId = 9; doctorId = 7 },
  @{ diagnosis = "Iron deficiency anemia"; treatment = "Iron supplementation, dietary modification"; prescription = "Ferrous sulfate 325mg daily, Vitamin C 500mg daily"; recordDate = "2026-08-10"; patientId = 10; doctorId = 8 },
  @{ diagnosis = "Osteoarthritis, right knee"; treatment = "Physical therapy, weight management, NSAIDs"; prescription = "Naproxen 500mg BID, Glucosamine 1500mg daily"; recordDate = "2026-08-09"; patientId = 12; doctorId = 3 },
  @{ diagnosis = "Viral upper respiratory infection"; treatment = "Rest, fluids, symptomatic relief"; prescription = "Paracetamol 500mg QID PRN, Chlorpheniramine 4mg TID"; recordDate = "2026-08-09"; patientId = 13; doctorId = 14 },
  @{ diagnosis = "Anxiety disorder, generalized"; treatment = "CBT referral, short-term anxiolytic"; prescription = "Escitalopram 10mg daily, Clonazepam 0.25mg PRN"; recordDate = "2026-08-08"; patientId = 11; doctorId = 2 },
  @{ diagnosis = "Childhood asthma, mild persistent"; treatment = "Inhaled corticosteroid, action plan education"; prescription = "Fluticasone inhaler 50mcg BID, Salbutamol inhaler PRN"; recordDate = "2026-08-08"; patientId = 14; doctorId = 4 },
  @{ diagnosis = "Gastroesophageal reflux disease"; treatment = "PPI therapy, dietary and lifestyle changes"; prescription = "Omeprazole 20mg daily before breakfast, Domperidone 10mg TID"; recordDate = "2026-08-07"; patientId = 15; doctorId = 8 },
  @{ diagnosis = "Contact dermatitis, occupational"; treatment = "Allergen avoidance, topical treatment"; prescription = "Hydrocortisone 1% cream BID, Loratadine 10mg daily"; recordDate = "2026-08-07"; patientId = 16; doctorId = 13 }
)

foreach ($rec in $records) {
  $body = $rec | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Uri "$base/medical-records" -Method POST -Body $body -Headers $headers
    Write-Host "  Created record: $($rec.diagnosis) for Patient $($rec.patientId) (ID: $($res.id))" -ForegroundColor Green
  } catch {
    Write-Host "  Failed: $($rec.diagnosis) - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Seeding Bills ===" -ForegroundColor Cyan

$bills = @(
  @{ amount = 3500.00; billDate = "2026-08-13"; paymentStatus = "PAID"; patientId = 2; appointmentId = 16 },
  @{ amount = 4200.00; billDate = "2026-08-13"; paymentStatus = "PAID"; patientId = 4; appointmentId = 17 },
  @{ amount = 2800.00; billDate = "2026-08-13"; paymentStatus = "PENDING"; patientId = 6; appointmentId = 18 },
  @{ amount = 5500.00; billDate = "2026-08-14"; paymentStatus = "PENDING"; patientId = 2; appointmentId = 1 },
  @{ amount = 3000.00; billDate = "2026-08-14"; paymentStatus = "PENDING"; patientId = 3; appointmentId = 2 },
  @{ amount = 7500.00; billDate = "2026-08-14"; paymentStatus = "PENDING"; patientId = 4; appointmentId = 3 },
  @{ amount = 2500.00; billDate = "2026-08-14"; paymentStatus = "PENDING"; patientId = 5; appointmentId = 4 },
  @{ amount = 4000.00; billDate = "2026-08-14"; paymentStatus = "PENDING"; patientId = 6; appointmentId = 5 },
  @{ amount = 3200.00; billDate = "2026-08-15"; paymentStatus = "PENDING"; patientId = 7; appointmentId = 6 },
  @{ amount = 6000.00; billDate = "2026-08-15"; paymentStatus = "PENDING"; patientId = 8; appointmentId = 7 },
  @{ amount = 2750.00; billDate = "2026-08-15"; paymentStatus = "PENDING"; patientId = 9; appointmentId = 8 },
  @{ amount = 4500.00; billDate = "2026-08-15"; paymentStatus = "PENDING"; patientId = 10; appointmentId = 9 },
  @{ amount = 3800.00; billDate = "2026-08-15"; paymentStatus = "PENDING"; patientId = 11; appointmentId = 10 },
  @{ amount = 5000.00; billDate = "2026-08-16"; paymentStatus = "PENDING"; patientId = 12; appointmentId = 11 },
  @{ amount = 2900.00; billDate = "2026-08-16"; paymentStatus = "PENDING"; patientId = 13; appointmentId = 12 }
)

foreach ($bill in $bills) {
  $body = $bill | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Uri "$base/bills" -Method POST -Body $body -Headers $headers
    Write-Host "  Created bill: Rs.$($bill.amount) for Patient $($bill.patientId), Status: $($bill.paymentStatus) (ID: $($res.id))" -ForegroundColor Green
  } catch {
    Write-Host "  Failed: Patient $($bill.patientId) - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Seeding Complete! ===" -ForegroundColor Cyan
Write-Host "  15 Medical Records" -ForegroundColor White
Write-Host "  15 Bills (2 PAID, 13 PENDING)" -ForegroundColor White
