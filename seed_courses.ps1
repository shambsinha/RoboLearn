
$baseUrl = "http://127.0.0.1:8080/api"
$loginUrl = "$baseUrl/auth/login"

# 1. Login as Admin to get Token
$loginBody = @{
    email = "admin@robolearn.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Attempting to login as Admin..."
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
} catch {
    Write-Host "Login failed. Attempting to Register Admin..."
    $regBody = @{
        username = "admin"
        email = "admin@robolearn.com"
        password = "admin123"
        role = "ADMIN"
        onboardingStatus = "Professional"
    } | ConvertTo-Json
    
    try {
        $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
        $token = $regResponse.token
        Write-Host "Admin registered successfully."
    } catch {
        Write-Error "Failed to Login or Register Admin. Details: $($_.Exception.Message)"
        exit
    }
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Define Course Data
$courses = @(
    @{
        title = "Java Mastery: Enterprise Development"
        description = "A comprehensive deep-dive into Java programming, from JVM internals to advanced concurrency patterns."
        level = "BEGINNER"
        category = "Programming"
        modules = @(
            "JVM Architecture & Memory Model", "Data Types & Flow Control", "Object-Oriented Design Patterns",
            "Exception Management Strategies", "Generics & Collections", "Functional Programming & Lambdas",
            "Java Streams API", "Multithreading & Executor Service", "File I/O & Networking", "Spring Boot Basics"
        )
    },
    @{
        title = "Operating Systems: Kernel & Shell"
        description = "Master the core concepts of OS design, including process scheduling, memory virtualization, and file systems."
        level = "ADVANCED"
        category = "Computer Science"
        modules = @(
            "OS History & System Calls", "Process Life Cycle & PCB", "CPU Scheduling Algorithms",
            "Inter-Process Communication", "Deadlock Detection & Prevention", "Physical Memory Management",
            "Virtual Memory & Paging", "Storage Systems & Disk Scheduling", "File System Implementation", "OS Security"
        )
    },
    @{
        title = "Computer System Architecture (CSA)"
        description = "Explore the hardware-software interface. Learn about instruction sets, pipelining, and memory hierarchy."
        level = "INTERMEDIATE"
        category = "Computer Science"
        modules = @(
            "Binary Systems & Boolean Logic", "Instruction Set Architecture", "ALU & Floating Point Ops",
            "Control Unit Design", "RISC vs CISC Architecture", "Instruction Pipelining",
            "Cache Memory Optimization", "Virtual Memory Systems", "I/O & DMA Controllers", "Parallel Processing"
        )
    },
    @{
        title = "AWS Cloud Solutions Architect"
        description = "Comprehensive guide to Amazon Web Services. Learn to design scalable and resilient cloud architectures."
        level = "INTERMEDIATE"
        category = "Cloud Computing"
        modules = @(
            "Cloud Foundations", "IAM & Security Groups", "EC2 & Compute Scaling",
            "S3 & Storage Classes", "VPC Networking", "RDS & DynamoDB Systems",
            "Serverless with AWS Lambda", "CloudWatch & Monitoring", "Route 53 & CloudFront", "Well-Architected Framework"
        )
    },
    @{
        title = "DBMS: Relational & Distributed Systems"
        description = "Learn how to design, optimize, and manage large-scale data systems using SQL and NoSQL technologies."
        level = "INTERMEDIATE"
        category = "Data Science"
        modules = @(
            "ER Modeling & Data Abstraction", "Relational Algebra & Calculus", "Advanced SQL & Joins",
            "Query Optimization & Indexing", "Functional Dependencies", "Normalization (1NF-BCNF)",
            "Transaction ACID Properties", "Concurrency Control Mechanisms", "Recovery Systems", "NoSQL & CAP Theorem"
        )
    }
)

foreach ($c in $courses) {
    Write-Host "Creating Course: $($c.title)..."
    $courseReq = @{
        title = $c.title
        description = $c.description
        level = $c.level
        category = $c.category
    } | ConvertTo-Json
    
    $courseRes = Invoke-RestMethod -Uri "$baseUrl/admin/courses" -Method Post -Body $courseReq -Headers $headers
    $courseId = $courseRes.courseId

    Write-Host "Course Created with ID: $courseId. Adding Modules..."
    $order = 1
    foreach ($mTitle in $c.modules) {
        $moduleReq = @{
            title = $mTitle
            serialOrder = $order++
        } | ConvertTo-Json
        
        $null = Invoke-RestMethod -Uri "$baseUrl/admin/courses/$courseId/modules" -Method Post -Body $moduleReq -Headers $headers
        Write-Host "  Added Module: $mTitle"
    }
}

Write-Host "Finished seeding courses via API!"
