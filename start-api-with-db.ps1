$ErrorActionPreference = "Stop"

function Set-DefaultEnv {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Value
  )

  if (-not [Environment]::GetEnvironmentVariable($Name, "Process")) {
    [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
  }
}

function Set-SecretEnv {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Prompt
  )

  if ([Environment]::GetEnvironmentVariable($Name, "Process")) {
    $answer = Read-Host "$Name is already set. Replace it? (y/N)"
    if ($answer -ne "y" -and $answer -ne "Y") {
      Write-Host "$Name was kept."
      return
    }
  }

  $secureValue = Read-Host $Prompt -AsSecureString
  if ($secureValue.Length -eq 0) {
    Write-Host "$Name was skipped."
    return
  }

  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
  try {
    $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim()
    [Environment]::SetEnvironmentVariable($Name, $plainValue, "Process")
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

Set-DefaultEnv -Name "PGHOST" -Value "100.123.164.85"
Set-DefaultEnv -Name "PGPORT" -Value "5433"
Set-DefaultEnv -Name "PGDATABASE" -Value "popcorn_pc"
Set-DefaultEnv -Name "PGUSER" -Value "postgres"
Set-DefaultEnv -Name "PORT" -Value "3000"

Set-SecretEnv -Name "PGPASSWORD" -Prompt "PGPASSWORD (empty if trust/no password)"

Write-Host "PGHOST=$([Environment]::GetEnvironmentVariable("PGHOST", "Process"))"
Write-Host "PGPORT=$([Environment]::GetEnvironmentVariable("PGPORT", "Process"))"
Write-Host "PGDATABASE=$([Environment]::GetEnvironmentVariable("PGDATABASE", "Process"))"
Write-Host "PGUSER=$([Environment]::GetEnvironmentVariable("PGUSER", "Process"))"

Set-Location -LiteralPath (Join-Path $PSScriptRoot "app")
& "C:\Program Files\nodejs\npm.cmd" run server
