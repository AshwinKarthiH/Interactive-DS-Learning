$ErrorActionPreference='Stop'
$backendRoot=$PSScriptRoot
if (-not $env:JAVA_HOME) {
 $jdkCandidate=Get-ChildItem 'C:/Program Files/Java' -Directory -Filter 'jdk*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
 if ($jdkCandidate) {$env:JAVA_HOME=$jdkCandidate.FullName}
}
if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin/javac.exe'))) {throw 'Install JDK 21 or newer and set JAVA_HOME to its directory.'}
$mavenRoot=Join-Path $backendRoot '.tools/apache-maven-3.9.16'
if (-not (Test-Path -LiteralPath (Join-Path $mavenRoot 'bin/m2.conf'))) {
 New-Item -ItemType Directory -Path (Join-Path $backendRoot '.tools') -Force | Out-Null
 $mavenZip=Join-Path $backendRoot '.tools/maven.zip'
 $url='https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.16/apache-maven-3.9.16-bin.zip'
 Write-Host 'Downloading Apache Maven into this project…'
 Invoke-WebRequest -Uri $url -OutFile $mavenZip
 $expected=(Invoke-WebRequest -Uri ($url+'.sha512')).Content.Trim().Split(' ')[0]
 $actual=(Get-FileHash -LiteralPath $mavenZip -Algorithm SHA512).Hash
 if ($expected -ne $actual) {throw 'Maven checksum verification failed.'}
 Expand-Archive -LiteralPath $mavenZip -DestinationPath (Join-Path $backendRoot '.tools') -Force
}
& (Join-Path $env:JAVA_HOME 'bin/java.exe') "-Dmaven.multiModuleProjectDirectory=$backendRoot" "-Dmaven.home=$mavenRoot" "-Dclassworlds.conf=$mavenRoot/bin/m2.conf" "-Dmaven.repo.local=$backendRoot/.tools/repository" -cp "$mavenRoot/boot/*" org.codehaus.plexus.classworlds.launcher.Launcher -f "$backendRoot/pom.xml" -B -ntp package
if ($LASTEXITCODE -ne 0) {throw 'Build or tests failed.'}
