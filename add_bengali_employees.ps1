# HRMS - Add 10 Bengali Employees Script
$apiUrl = "http://localhost:5000/api/employee"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy94bWwyMDAxL3htbHNjaGVtYSNuYW1laWRlbnRpZmllciI6ImFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJIUk1TLkFwaSIsIkF1ZGllbmNlIjoiSFJNUy5DbGllbnQiLCJleHAiOjE3NDcyNjMyODAsImlzcyI6IkhSTVMuQXBpIiwiYXVkIjoiSFJNUy5DbGllbnQifQ.sBf4jJDMKnZLKXCpzcvLxPvqXhvGxcjKTyYtB9aMFCo"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Array of 10 Bengali employees
$employees = @(
    @{
        EmployeeNumber = "EMP001"
        FirstName = "রহিম"
        LastName = "আহমেদ"
        Email = "rahim.ahmed@hrms.com"
        ContactNumber = "+880191234567"
        Position = "সিনিয়র ডেভেলপার"
        AccountNumber = "ACC001"
        EmploymentStatus = "Active"
        DateOfJoining = "2024-01-15T00:00:00Z"
        DepartmentId = 1
    },
    @{
        EmployeeNumber = "EMP002"
        FirstName = "ফাতিমা"
        LastName = "খান"
        Email = "fatima.khan@hrms.com"
        ContactNumber = "+880191234568"
        Position = "এইচআর ম্যানেজার"
        AccountNumber = "ACC002"
        EmploymentStatus = "Active"
        DateOfJoining = "2023-06-20T00:00:00Z"
        DepartmentId = 2
    },
    @{
        EmployeeNumber = "EMP003"
        FirstName = "করিম"
        LastName = "হোসেন"
        Email = "karim.hosen@hrms.com"
        ContactNumber = "+880191234569"
        Position = "সফটওয়্যার আর্কিটেক্ট"
        AccountNumber = "ACC003"
        EmploymentStatus = "Active"
        DateOfJoining = "2023-03-10T00:00:00Z"
        DepartmentId = 1
    },
    @{
        EmployeeNumber = "EMP004"
        FirstName = "নাজমা"
        LastName = "বেগম"
        Email = "nazma.begum@hrms.com"
        ContactNumber = "+880191234570"
        Position = "প্রজেক্ট ম্যানেজার"
        AccountNumber = "ACC004"
        EmploymentStatus = "Active"
        DateOfJoining = "2024-02-08T00:00:00Z"
        DepartmentId = 3
    },
    @{
        EmployeeNumber = "EMP005"
        FirstName = "আলী"
        LastName = "সিদ্ধার্থ"
        Email = "ali.siddharth@hrms.com"
        ContactNumber = "+880191234571"
        Position = "জুনিয়র ডেভেলপার"
        AccountNumber = "ACC005"
        EmploymentStatus = "Active"
        DateOfJoining = "2024-04-12T00:00:00Z"
        DepartmentId = 1
    },
    @{
        EmployeeNumber = "EMP006"
        FirstName = "সুমাইয়া"
        LastName = "রহমান"
        Email = "sumaiya.rahman@hrms.com"
        ContactNumber = "+880191234572"
        Position = "ডেটাবেস অ্যাডমিনিস্ট্রেটর"
        AccountNumber = "ACC006"
        EmploymentStatus = "Active"
        DateOfJoining = "2023-09-15T00:00:00Z"
        DepartmentId = 1
    },
    @{
        EmployeeNumber = "EMP007"
        FirstName = "মোহাম্মদ"
        LastName = "ইউসুফ"
        Email = "mohammad.yusuf@hrms.com"
        ContactNumber = "+880191234573"
        Position = "সিস্টেম অ্যাডমিনিস্ট্রেটর"
        AccountNumber = "ACC007"
        EmploymentStatus = "Active"
        DateOfJoining = "2023-11-20T00:00:00Z"
        DepartmentId = 3
    },
    @{
        EmployeeNumber = "EMP008"
        FirstName = "রেহানা"
        LastName = "ইয়াসমিন"
        Email = "rehana.yasmin@hrms.com"
        ContactNumber = "+880191234574"
        Position = "বিজনেস অ্যানালিস্ট"
        AccountNumber = "ACC008"
        EmploymentStatus = "Active"
        DateOfJoining = "2024-01-25T00:00:00Z"
        DepartmentId = 2
    },
    @{
        EmployeeNumber = "EMP009"
        FirstName = "আব্দুল"
        LastName = "করিম"
        Email = "abdul.karim@hrms.com"
        ContactNumber = "+880191234575"
        Position = "টেকনিক্যাল লিড"
        AccountNumber = "ACC009"
        EmploymentStatus = "Active"
        DateOfJoining = "2023-08-05T00:00:00Z"
        DepartmentId = 1
    },
    @{
        EmployeeNumber = "EMP010"
        FirstName = "তৌসিফা"
        LastName = "নাজিব"
        Email = "tousifa.nazib@hrms.com"
        ContactNumber = "+880191234576"
        Position = "কোয়ালিটি অ্যাসিওরেন্স ইঞ্জিনিয়ার"
        AccountNumber = "ACC010"
        EmploymentStatus = "Active"
        DateOfJoining = "2024-03-18T00:00:00Z"
        DepartmentId = 1
    }
)

# Add each employee
$successCount = 0
$failureCount = 0

foreach ($i in 0..9) {
    $employee = $employees[$i]
    $body = $employee | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "✓ Employee $($i+1) ($($employee.FirstName) $($employee.LastName)): Created successfully (Status: $($response.StatusCode))"
        $successCount++
    }
    catch {
        Write-Host "✗ Employee $($i+1) ($($employee.FirstName) $($employee.LastName)): Failed - $($_.Exception.Message)"
        $failureCount++
    }
    
    # Small delay to avoid overwhelming the API
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "========================================="
Write-Host "Summary: $successCount succeeded, $failureCount failed"
Write-Host "========================================="
