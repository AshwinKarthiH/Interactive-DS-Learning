$ErrorActionPreference='Stop'
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {throw 'Install and start Docker Desktop with Linux containers first.'}
docker build -t algoverse-judge:1 $PSScriptRoot
if ($LASTEXITCODE -ne 0) {throw 'Judge image build failed.'}
Write-Host 'Judge image ready. Restart the Spring Boot server to enable all five languages.'
