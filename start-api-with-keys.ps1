$ErrorActionPreference = "Stop"

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
    $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    $plainValue = $plainValue.Trim()
    if ($plainValue.StartsWith("Bearer ")) {
      $plainValue = $plainValue.Substring(7).Trim()
    }
    $plainValue = $plainValue.Trim('"').Trim("'")
    [Environment]::SetEnvironmentVariable($Name, $plainValue, "Process")
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

Set-SecretEnv -Name "GEMINI_API_KEY" -Prompt "GEMINI_API_KEY"
Set-SecretEnv -Name "OPENAI_API_KEY" -Prompt "OPENAI_API_KEY"
Set-SecretEnv -Name "ANTHROPIC_API_KEY" -Prompt "ANTHROPIC_API_KEY"

$openAiKey = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "Process")
$anthropicKey = [Environment]::GetEnvironmentVariable("ANTHROPIC_API_KEY", "Process")
$geminiKey = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY", "Process")

if ($openAiKey -and $openAiKey.StartsWith("sk-ant-")) {
  Write-Warning "OPENAI_API_KEY looks like an Anthropic key. OpenAI keys usually start with sk-proj- or sk-."
}

if ($anthropicKey -and -not $anthropicKey.StartsWith("sk-ant-")) {
  Write-Warning "ANTHROPIC_API_KEY does not look like an Anthropic key. Anthropic keys usually start with sk-ant-."
}

if ($geminiKey -and -not $geminiKey.StartsWith("AIza")) {
  Write-Warning "GEMINI_API_KEY does not look like a Google AI Studio key. Gemini keys often start with AIza."
}

[Environment]::SetEnvironmentVariable("PORT", "3000", "Process")

Set-Location -LiteralPath (Join-Path $PSScriptRoot "app")
& "C:\Program Files\nodejs\npm.cmd" run server
