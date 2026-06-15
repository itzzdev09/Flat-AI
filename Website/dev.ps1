$ErrorActionPreference = "Continue"

$backendEnvPath = Join-Path $PSScriptRoot "Backend\.env"
$backendEnv = @{}
if (Test-Path $backendEnvPath) {
    Get-Content $backendEnvPath | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
        $parts = $_ -split '=', 2
        $backendEnv[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$mlEnv = @{}
foreach ($key in @('MONGODB_URI', 'MONGODB_URI_ATLAS', 'MONGO_URI')) {
    if ($backendEnv.ContainsKey($key)) {
        $mlEnv[$key] = $backendEnv[$key]
    }
}

# Prefer the repo virtualenv so Django starts with the exact dependencies this project needs.
$pythonExe = Join-Path $PSScriptRoot "..\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

$djangoCheck = & $pythonExe -c "import django" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Django is not installed for the active Python. Run this first:"
    Write-Host "cd `"$PSScriptRoot\ml`""
    Write-Host "python -m pip install -r requirements.txt"
    exit 1
}

$services = @(
    @{ Name = "backend"; Directory = Join-Path $PSScriptRoot "Backend"; Command = "node server.js"; Environment = $backendEnv },
    @{ Name = "frontend"; Directory = Join-Path $PSScriptRoot "frontend"; Command = "npm start"; Environment = @{} },
    @{ Name = "ml"; Directory = Join-Path $PSScriptRoot "ml"; Command = "`"$pythonExe`" manage.py runserver 0.0.0.0:8000"; Environment = $mlEnv }
)

$jobs = foreach ($service in $services) {
    Start-Job -Name $service.Name -ScriptBlock {
        param($directory, $command, $environment)
        Set-Location $directory
        $env:BROWSER = "none"
        foreach ($entry in $environment.GetEnumerator()) {
            Set-Item -Path ("Env:" + $entry.Key) -Value $entry.Value
        }
        Invoke-Expression $command 2>&1
    } -ArgumentList $service.Directory, $service.Command, $service.Environment
}

try {
    Write-Host "Started backend, frontend, and ML services. Press Ctrl+C to stop."
    while ($true) {
        foreach ($job in $jobs) {
            Receive-Job $job
            if ($job.State -eq "Failed") {
                throw "$($job.Name) failed to start."
            }
        }
        Start-Sleep -Seconds 1
    }
}
finally {
    foreach ($job in $jobs) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
    }
}
