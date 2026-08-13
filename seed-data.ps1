$base = "http://localhost:8080/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== Seeding Departments ===" -ForegroundColor Cyan

$departments = @(
  @{ name = "Cardiology"; description = "Heart and cardiovascular system treatment" },
  @{ name = "Neurology"; description = "Brain, spinal cord and nervous system disorders" },
  @{ name = "Orthopedics"; description = "Musculoskeletal system, bones and joints" },
  @{ name = "Pediatrics"; description = "Medical care for infants, children and adolescents" },
  @{ name = "Dermatology"; description = "Skin, hair and nail conditions" },
  @{ name = "Ophthalmology"; description = "Eye and vision care" },
  @{ name = "ENT"; description = "Ear, nose and throat treatment" },
  @{ name = "General Medicine"; description = "Primary healthcare and general diagnosis" }
)

foreach ($dept in $departments) {
  $body = $dept | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Uri "$base/departments" -Method POST -Body $body -Headers $headers
    Write-Host "  Created department: $($res.name) (ID: $($res.id))" -ForegroundColor Green
  } catch {
    Write-Host "  Failed to create department: $($dept.name) - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Seeding Doctors ===" -ForegroundColor Cyan

$doctors = @(
  @{ name = "Dr. Amal Perera"; specialization = "Cardiologist"; phone = "0771234567"; email = "amal.perera@medicarehub.lk"; departmentId = 1 },
  @{ name = "Dr. Nimal Fernando"; specialization = "Neurologist"; phone = "0772345678"; email = "nimal.fernando@medicarehub.lk"; departmentId = 2 },
  @{ name = "Dr. Samantha Silva"; specialization = "Orthopedic Surgeon"; phone = "0773456789"; email = "samantha.silva@medicarehub.lk"; departmentId = 3 },
  @{ name = "Dr. Kumari Jayasinghe"; specialization = "Pediatrician"; phone = "0774567890"; email = "kumari.j@medicarehub.lk"; departmentId = 4 },
  @{ name = "Dr. Ruwan Dissanayake"; specialization = "Dermatologist"; phone = "0775678901"; email = "ruwan.d@medicarehub.lk"; departmentId = 5 },
  @{ name = "Dr. Malini Ratnayake"; specialization = "Ophthalmologist"; phone = "0776789012"; email = "malini.r@medicarehub.lk"; departmentId = 6 },
  @{ name = "Dr. Sunil Bandara"; specialization = "ENT Specialist"; phone = "0777890123"; email = "sunil.b@medicarehub.lk"; departmentId = 7 },
  @{ name = "Dr. Priya Wickramasinghe"; specialization = "General Physician"; phone = "0778901234"; email = "priya.w@medicarehub.lk"; departmentId = 8 },
  @{ name = "Dr. Kavindu Seneviratne"; specialization = "Cardiologist"; phone = "0779012345"; email = "kavindu.s@medicarehub.lk"; departmentId = 1 },
  @{ name = "Dr. Tharushi De Silva"; specialization = "Neurologist"; phone = "0770123456"; email = "tharushi.d@medicarehub.lk"; departmentId = 2 },
  @{ name = "Dr. Dinesh Rajapaksa"; specialization = "Orthopedic Surgeon"; phone = "0771122334"; email = "dinesh.r@medicarehub.lk"; departmentId = 3 },
  @{ name = "Dr. Iresha Gunasekara"; specialization = "Pediatrician"; phone = "0772233445"; email = "iresha.g@medicarehub.lk"; departmentId = 4 },
  @{ name = "Dr. Chaminda Weerasinghe"; specialization = "Dermatologist"; phone = "0773344556"; email = "chaminda.w@medicarehub.lk"; departmentId = 5 },
  @{ name = "Dr. Lakshmi Herath"; specialization = "General Physician"; phone = "0774455667"; email = "lakshmi.h@medicarehub.lk"; departmentId = 8 },
  @{ name = "Dr. Roshan Amarasekara"; specialization = "ENT Specialist"; phone = "0775566778"; email = "roshan.a@medicarehub.lk"; departmentId = 7 }
)

foreach ($doc in $doctors) {
  $body = $doc | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Uri "$base/doctors" -Method POST -Body $body -Headers $headers
    Write-Host "  Created doctor: $($res.name) (ID: $($res.id))" -ForegroundColor Green
  } catch {
    Write-Host "  Failed to create doctor: $($doc.name) - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Seeding Patients ===" -ForegroundColor Cyan

$patients = @(
  @{ name = "Kasun Wijeratne"; age = 34; gender = "Male"; phone = "0711234567"; email = "kasun.w@gmail.com"; address = "42 Galle Road, Colombo 03"; bloodGroup = "A+" },
  @{ name = "Nimasha Samarawickrama"; age = 28; gender = "Female"; phone = "0712345678"; email = "nimasha.s@gmail.com"; address = "15 Temple Road, Kandy"; bloodGroup = "B+" },
  @{ name = "Saman Kumara"; age = 52; gender = "Male"; phone = "0713456789"; email = "saman.k@gmail.com"; address = "78 Main Street, Galle"; bloodGroup = "O+" },
  @{ name = "Dilini Perera"; age = 41; gender = "Female"; phone = "0714567890"; email = "dilini.p@gmail.com"; address = "23 Lake Drive, Kurunegala"; bloodGroup = "AB+" },
  @{ name = "Thilina Rajapaksa"; age = 67; gender = "Male"; phone = "0715678901"; email = "thilina.r@gmail.com"; address = "9 Hill Street, Nuwara Eliya"; bloodGroup = "A-" },
  @{ name = "Sachini Fernando"; age = 23; gender = "Female"; phone = "0716789012"; email = "sachini.f@gmail.com"; address = "56 Beach Road, Negombo"; bloodGroup = "B-" },
  @{ name = "Rohan De Silva"; age = 45; gender = "Male"; phone = "0717890123"; email = "rohan.ds@gmail.com"; address = "101 Station Road, Matara"; bloodGroup = "O-" },
  @{ name = "Ayesha Jayawardena"; age = 36; gender = "Female"; phone = "0718901234"; email = "ayesha.j@gmail.com"; address = "34 Park Avenue, Colombo 07"; bloodGroup = "A+" },
  @{ name = "Chamara Bandara"; age = 58; gender = "Male"; phone = "0719012345"; email = "chamara.b@gmail.com"; address = "67 Royal Gardens, Anuradhapura"; bloodGroup = "AB-" },
  @{ name = "Pavithra Senanayake"; age = 30; gender = "Female"; phone = "0710123456"; email = "pavithra.s@gmail.com"; address = "12 Flower Road, Colombo 07"; bloodGroup = "O+" },
  @{ name = "Nuwan Wickramasinghe"; age = 72; gender = "Male"; phone = "0711122334"; email = "nuwan.w@gmail.com"; address = "88 High Level Road, Maharagama"; bloodGroup = "B+" },
  @{ name = "Hiruni Gunaratne"; age = 19; gender = "Female"; phone = "0712233445"; email = "hiruni.g@gmail.com"; address = "5 School Lane, Ratnapura"; bloodGroup = "A+" },
  @{ name = "Malik Fonseka"; age = 48; gender = "Male"; phone = "0713344556"; email = "malik.f@gmail.com"; address = "29 Duplication Road, Colombo 04"; bloodGroup = "O+" },
  @{ name = "Sanduni Herath"; age = 55; gender = "Female"; phone = "0714455667"; email = "sanduni.h@gmail.com"; address = "41 Green Path, Colombo 07"; bloodGroup = "AB+" },
  @{ name = "Isuru Dissanayake"; age = 38; gender = "Male"; phone = "0715566778"; email = "isuru.d@gmail.com"; address = "73 Kandy Road, Kadawatha"; bloodGroup = "B-" }
)

foreach ($pat in $patients) {
  $body = $pat | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Uri "$base/patients" -Method POST -Body $body -Headers $headers
    Write-Host "  Created patient: $($res.name) (ID: $($res.id))" -ForegroundColor Green
  } catch {
    Write-Host "  Failed to create patient: $($pat.name) - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Seeding Appointments ===" -ForegroundColor Cyan

$appointments = @(
  @{ appointmentDate = "2026-08-14"; appointmentTime = "09:00:00"; status = "SCHEDULED"; patientId = 1; doctorId = 1 },
  @{ appointmentDate = "2026-08-14"; appointmentTime = "09:30:00"; status = "SCHEDULED"; patientId = 2; doctorId = 2 },
  @{ appointmentDate = "2026-08-14"; appointmentTime = "10:00:00"; status = "SCHEDULED"; patientId = 3; doctorId = 3 },
  @{ appointmentDate = "2026-08-14"; appointmentTime = "10:30:00"; status = "SCHEDULED"; patientId = 4; doctorId = 4 },
  @{ appointmentDate = "2026-08-14"; appointmentTime = "11:00:00"; status = "SCHEDULED"; patientId = 5; doctorId = 5 },
  @{ appointmentDate = "2026-08-15"; appointmentTime = "09:00:00"; status = "SCHEDULED"; patientId = 6; doctorId = 6 },
  @{ appointmentDate = "2026-08-15"; appointmentTime = "09:30:00"; status = "SCHEDULED"; patientId = 7; doctorId = 7 },
  @{ appointmentDate = "2026-08-15"; appointmentTime = "10:00:00"; status = "SCHEDULED"; patientId = 8; doctorId = 8 },
  @{ appointmentDate = "2026-08-15"; appointmentTime = "10:30:00"; status = "SCHEDULED"; patientId = 9; doctorId = 9 },
  @{ appointmentDate = "2026-08-15"; appointmentTime = "11:00:00"; status = "SCHEDULED"; patientId = 10; doctorId = 10 },
  @{ appointmentDate = "2026-08-16"; appointmentTime = "09:00:00"; status = "SCHEDULED"; patientId = 11; doctorId = 11 },
  @{ appointmentDate = "2026-08-16"; appointmentTime = "09:30:00"; status = "SCHEDULED"; patientId = 12; doctorId = 12 },
  @{ appointmentDate = "2026-08-16"; appointmentTime = "10:00:00"; status = "SCHEDULED"; patientId = 13; doctorId = 1 },
  @{ appointmentDate = "2026-08-16"; appointmentTime = "10:30:00"; status = "SCHEDULED"; patientId = 14; doctorId = 2 },
  @{ appointmentDate = "2026-08-16"; appointmentTime = "11:00:00"; status = "SCHEDULED"; patientId = 15; doctorId = 3 },
  @{ appointmentDate = "2026-08-13"; appointmentTime = "08:30:00"; status = "COMPLETED"; patientId = 1; doctorId = 8 },
  @{ appointmentDate = "2026-08-13"; appointmentTime = "09:00:00"; status = "COMPLETED"; patientId = 3; doctorId = 5 },
  @{ appointmentDate = "2026-08-13"; appointmentTime = "09:30:00"; status = "COMPLETED"; patientId = 5; doctorId = 1 },
  @{ appointmentDate = "2026-08-17"; appointmentTime = "14:00:00"; status = "SCHEDULED"; patientId = 2; doctorId = 9 },
  @{ appointmentDate = "2026-08-17"; appointmentTime = "14:30:00"; status = "SCHEDULED"; patientId = 7; doctorId = 14 }
)

foreach ($apt in $appointments) {
  $body = $apt | ConvertTo-Json
  try {
    $res = Invoke-RestMethod -Uri "$base/appointments" -Method POST -Body $body -Headers $headers
    Write-Host "  Created appointment: Patient $($apt.patientId) with Doctor $($apt.doctorId) on $($apt.appointmentDate) (ID: $($res.id))" -ForegroundColor Green
  } catch {
    Write-Host "  Failed to create appointment: $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Seeding Complete! ===" -ForegroundColor Cyan
Write-Host "  8 Departments" -ForegroundColor White
Write-Host "  15 Doctors" -ForegroundColor White
Write-Host "  15 Patients" -ForegroundColor White
Write-Host "  20 Appointments" -ForegroundColor White
