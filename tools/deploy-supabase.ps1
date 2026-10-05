param(
  [Parameter(Mandatory=$true)]
  [ValidatePattern('^[a-z0-9]{20}$')]
  [string]$ProjectRef,
  [ValidateSet('closed','open')]
  [string]$Registration = 'closed'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  Write-Host 'Deploying to your EXISTING free Supabase project. This does not create an account or accept billing.'
  Write-Host 'Sign in securely in the browser when prompted. Never paste passwords or access tokens into chat.'
  & npx --yes supabase@2.119.0 login
  if ($LASTEXITCODE -ne 0) { throw 'Supabase sign-in did not complete.' }
  & npx --yes supabase@2.119.0 link --project-ref $ProjectRef
  if ($LASTEXITCODE -ne 0) { throw 'Project linking failed. Use the project database password only in the CLI secure prompt.' }
  & npx --yes supabase@2.119.0 db push
  if ($LASTEXITCODE -ne 0) { throw 'Database migration failed; deployment stopped.' }
  & npx --yes supabase@2.119.0 secrets set --project-ref $ProjectRef 'GG_ALLOWED_ORIGINS=https://evil0ctopus.github.io' 'GG_SITE_URL=https://evil0ctopus.github.io/grim-gatherings/workshop.html' "GG_REGISTRATION=$Registration"
  if ($LASTEXITCODE -ne 0) { throw 'Function settings could not be saved.' }
  & npx --yes supabase@2.119.0 functions deploy community --project-ref $ProjectRef --use-api
  if ($LASTEXITCODE -ne 0) { throw 'Edge Function deployment failed.' }
  & node tools\configure-supabase.mjs $ProjectRef
  if ($LASTEXITCODE -ne 0) { throw 'Frontend activation failed; its prior configuration was left unchanged.' }
  Write-Host 'Backend deployed and local configuration connected. Registration is closed by default.'
  Write-Host 'Next: configure Auth Site URL/redirects and email delivery, create your account, grant admin using the documented SQL, then commit/push the frontend configuration.'
} finally {
  Pop-Location
}
