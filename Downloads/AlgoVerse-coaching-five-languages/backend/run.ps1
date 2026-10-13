param([switch]$LocalMongo,[switch]$SetupAdmin,[ValidateRange(0,65535)][int]$HttpPort=0)
$ErrorActionPreference='Stop'
$backendRoot=$PSScriptRoot
$envFile=Join-Path $backendRoot '.env'
if (Test-Path -LiteralPath $envFile) {
 foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line.Trim() -and -not $line.Trim().StartsWith('#')) {
   $pair=$line.Split('=',2);if ($pair.Length -eq 2) {[Environment]::SetEnvironmentVariable($pair[0].Trim(),$pair[1].Trim(),'Process')}
  }
 }
}
$httpListenPort=if($HttpPort -gt 0){$HttpPort}elseif($env:PORT){[int]$env:PORT}else{8080}
if ($httpListenPort -lt 1 -or $httpListenPort -gt 65535) {throw 'PORT must be a number from 1 to 65535.'}
$env:PORT="$httpListenPort"
if (-not $env:APP_ORIGIN -or ($HttpPort -gt 0 -and $env:APP_ORIGIN -match '^http://(localhost|127\.0\.0\.1):\d+$')) {$env:APP_ORIGIN="http://localhost:$httpListenPort"}
$httpProbe=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$httpListenPort)
try {
 $httpProbe.Server.ExclusiveAddressUse=$true
 $httpProbe.Start()
} catch [Net.Sockets.SocketException] {
 if ($_.Exception.SocketErrorCode -eq [Net.Sockets.SocketError]::AddressAlreadyInUse) {throw "Port $httpListenPort is already in use. Open the existing app at http://localhost:$httpListenPort, or rerun with -HttpPort 8081 (choose another port if needed)."}
 throw
} finally {$httpProbe.Stop()}
if (-not $env:JAVA_HOME) {
 $jdkCandidate=Get-ChildItem 'C:/Program Files/Java' -Directory -Filter 'jdk*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
 if ($jdkCandidate) {$env:JAVA_HOME=$jdkCandidate.FullName}
}
if (-not $env:JAVA_HOME) {throw 'Install JDK 21 or newer and set JAVA_HOME.'}
$jar=Join-Path $backendRoot 'target/algoverse-server-1.0.0.jar'
if (-not (Test-Path -LiteralPath $jar)) {& (Join-Path $backendRoot 'build.ps1')}
if ($SetupAdmin) {
 do {
  $adminEmail=(Read-Host 'Initial administrator email (for example admin@example.com)').Trim()
  $emailValid=$adminEmail -match '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  if (-not $emailValid) {Write-Host 'Enter a complete email address, not just admin.' -ForegroundColor Yellow}
 } until ($emailValid)
 $env:ADMIN_EMAIL=$adminEmail
 do {
  $adminSecret=Read-Host 'Administrator password (10-64 characters)' -AsSecureString
  $adminPointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminSecret)
  try {$adminPassword=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($adminPointer)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($adminPointer)}
  $passwordValid=$adminPassword.Length -ge 10 -and $adminPassword.Length -le 64 -and [Text.Encoding]::UTF8.GetByteCount($adminPassword) -le 72
  if (-not $passwordValid) {Write-Host 'Use 10-64 characters and at most 72 UTF-8 bytes.' -ForegroundColor Yellow}
 } until ($passwordValid)
 $env:ADMIN_PASSWORD=$adminPassword
 $adminPassword=$null
}
$mongoProcess=$null
try {
 if ($LocalMongo) {
  $port=27017
  $listener=Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
  if (-not $listener) {
   $mongoCommand=Get-Command mongod -ErrorAction SilentlyContinue
   $mongoBinary=if($mongoCommand){$mongoCommand.Source}else{(Get-ChildItem 'C:/Program Files/MongoDB/Server/*/bin/mongod.exe' -ErrorAction SilentlyContinue | Select-Object -Last 1).FullName}
   if (-not $mongoBinary) {throw 'Install MongoDB Community Server, or configure MONGODB_URI for MongoDB Atlas and omit -LocalMongo.'}
   $dataPath=Join-Path $backendRoot '.data/mongodb';New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
   $mongoArgs=@('--dbpath',('"'+$dataPath+'"'),'--bind_ip','127.0.0.1','--port',"$port",'--logpath',('"'+(Join-Path $backendRoot '.data/mongodb.log')+'"'))
   $mongoProcess=Start-Process -FilePath $mongoBinary -ArgumentList $mongoArgs -WindowStyle Hidden -PassThru
   Start-Sleep -Seconds 2
   if ($mongoProcess.HasExited) {throw 'MongoDB could not start. Check backend/.data/mongodb.log.'}
  }
  if (-not $env:MONGODB_URI) {$env:MONGODB_URI='mongodb://127.0.0.1:27017/algoverse'}
 }
 Write-Host "Open $env:APP_ORIGIN after Spring Boot starts. Press Ctrl+C to stop."
 Push-Location $backendRoot
 try {& (Join-Path $env:JAVA_HOME 'bin/java.exe') -jar $jar} finally {Pop-Location}
 if ($LASTEXITCODE -ne 0) {throw 'Spring Boot could not start. Check the error immediately above.'}
} finally {
 [Environment]::SetEnvironmentVariable('ADMIN_PASSWORD',$null,'Process')
 if ($mongoProcess -and -not $mongoProcess.HasExited) {$mongoProcess | Stop-Process}
}
