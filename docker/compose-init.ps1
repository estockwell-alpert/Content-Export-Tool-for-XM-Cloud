[CmdletBinding()]
Param (
    [ValidateSet("xm1","xp0","xp1")]
    [string]$Topology = "xm1",

    [string]
    [ValidateNotNullOrEmpty()]
    $EnvFilePath = ".\.env.user",
    
    [Parameter(Mandatory = $true)]
    [string]
    [ValidateNotNullOrEmpty()]
    $LicenseXmlPath,
    
    # We do not need to use [SecureString] here since the value will be stored unencrypted in .env,
    # and used only for transient local example environment.
    [string]
    $SitecoreAdminPassword = "Password12345",
    
    # We do not need to use [SecureString] here since the value will be stored unencrypted in .env,
    # and used only for transient local example environment.
    [string]
    $SqlSaPassword = "Password12345",
    
    [string]
    $SqlServer = "mssql",
    
    [string]
    $SqlUserName = "sa",
    
    [boolean]
    $IsAlwaysEncrypted = $false,
    
    [string]
    $ProcessingEngineTasksDatabaseUserName = "dbo",
    
    [string]
    $CdHost = "lawcd.localhost",
    
    [string]
    $CmHost = "lawcm.localhost",
    
    [string]
    $IdHost = "lawid.localhost",

    # The link to a source NuGet Feed has been updated.
    # In case of a name conflict with local PSRepository we suggest unregistering previous version from the host.
    [string]
    $SitecoreGalleryRepositoryLocation = "https://nuget.sitecore.com/resources/v2/",
    
    [string]
    $CertDataFolder = ".\traefik\certs",
    
    [string]
    $SpecificVersion
)

$ErrorActionPreference = "Stop";
[boolean]$RootCertificateCreated = $false;

function Get-EnvironmentVariableNameList {
    param(
        [string]$EnvFilePath
    )
    
    $envVariableNameList = @()
    $envVariables = Get-Content -Path $EnvFilePath
    foreach ($envVariable in $envVariables) { 
        $envName = $envVariable.Split('=')[0]
        $envVariableNameList += $envName
    }
    return $envVariableNameList
}

 

function Add-WindowsHostsFileEntries{
    param(
        [string]$EnvFilePath,
        [string]$Topology,
        [string]$CdHost,
        [string]$CmHost,
        [string]$IdHost
    )
    
    Write-Information -MessageData "Starting adding Windows hosts file entries for '$Topology' topology..." -InformationAction Continue
    
    Add-HostsEntry "$CmHost"
    Add-HostsEntry "$IdHost"
    if (($Topology -eq "xm1") -or ($Topology -eq "xp1")) {
        Add-HostsEntry "$CdHost"
    }
    
    Write-Information -MessageData "Finish adding Windows hosts file entries for '$Topology' topology." -InformationAction Continue
}

 

function New-Certificates{
##################################
# Configure TLS/HTTPS certificates
##################################

Push-Location traefik\certs
try {
    $mkcert = ".\mkcert.exe"
    if ($null -ne (Get-Command mkcert.exe -ErrorAction SilentlyContinue)) {
        # mkcert installed in PATH
        $mkcert = "mkcert"
    } elseif (-not (Test-Path $mkcert)) {
        Write-Host "Downloading and installing mkcert certificate tool..." -ForegroundColor Green
        Invoke-WebRequest "https://github.com/FiloSottile/mkcert/releases/download/v1.4.1/mkcert-v1.4.1-windows-amd64.exe" -UseBasicParsing -OutFile mkcert.exe
        if ((Get-FileHash mkcert.exe).Hash -ne "1BE92F598145F61CA67DD9F5C687DFEC17953548D013715FF54067B34D7C3246") {
            Remove-Item mkcert.exe -Force
            throw "Invalid mkcert.exe file"
        }
    }
     Write-Host "Generating Traefik TLS certificate..." -ForegroundColor Green
    & $mkcert -install
    & $mkcert "xm1cm.localhost"
    & $mkcert "xm1id.localhost"
}
catch {
    Write-Error "An error occurred while attempting to generate TLS certificate: $_"
}
finally {
    Pop-Location
}


}

 

function InstallModule {
    Param(
        [String]$ModuleName,
        [String]$ModuleVersion
    )
    try {
        $repository = Get-PSRepository | Where-Object { $_.SourceLocation -eq $SitecoreGalleryRepositoryLocation }
        if (!$repository) {
            $tempRepositoryName = "Temp" + (New-Guid)
            Register-PSRepository -Name $tempRepositoryName -SourceLocation $SitecoreGalleryRepositoryLocation -InstallationPolicy Trusted
            $repository = Get-PSRepository | Where-Object { $_.SourceLocation -eq $SitecoreGalleryRepositoryLocation }
        }
        if (!$ModuleVersion) {
            $ModuleVersion = (Find-Module -Name $ModuleName -Repository $repository.Name -AllowPrerelease).Version
            Write-Host "The Docker tool version was not specified. The latest available '$ModuleVersion' version will be used."  -ForegroundColor Green  
        }

        $moduleInstalled = Get-InstalledModule -Name $ModuleName -RequiredVersion $ModuleVersion -AllowPrerelease -ErrorAction SilentlyContinue
        if (!$moduleInstalled) {
            Write-Host "Installing '$ModuleName' $ModuleVersion" -ForegroundColor Green
            Install-Module -Name $ModuleName -RequiredVersion $ModuleVersion -Repository $repository.Name -AllowClobber -AllowPrerelease -Scope CurrentUser -Force -ErrorAction "Stop"
        }
        $localModulePath = ((Get-Module $ModuleName -ListAvailable) | Where-Object Version -eq $ModuleVersion.Split("-")[0]).Path
        Write-Host "Importing '$ModuleName'  '$ModuleVersion' from '$localModulePath' ..." 
        Import-Module -Name $localModulePath
    }
    finally {
        if ($tempRepositoryName -and ($repository.Name -eq $tempRepositoryName)) {
            Unregister-PSRepository -Name $tempRepositoryName
        }
    }
}

function Invoke-ComposeInit {
    if (-not (Test-Path $LicenseXmlPath)) {
        throw "Did not find $LicenseXmlPath"
    }
    if (-not (Test-Path $LicenseXmlPath -PathType Leaf)) {
        throw "$LicenseXmlPath is not a file"
    }
    
    # Install and Import SitecoreDockerTools
    $ModuleName = "SitecoreDockerTools"
    InstallModule -ModuleName $ModuleName -ModuleVersion $SpecificVersion
    
    $idCertPassword = Get-SitecoreRandomString 12 -DisallowSpecial
    $envVariablesTable = @{ 
        "SITECORE_ADMIN_PASSWORD" = $SitecoreAdminPassword
        "SQL_SA_PASSWORD" = $SqlSaPassword
        "REPORTING_API_KEY" = "00112233445566778899AABBCCDDEEFF"
        "TELERIK_ENCRYPTION_KEY" = Get-SitecoreRandomString 128 -DisallowSpecial
        "MEDIA_REQUEST_PROTECTION_SHARED_SECRET" = Get-SitecoreRandomString 64 -DisallowSpecial
        "SITECORE_IDSECRET" = Get-SitecoreRandomString 64 -DisallowSpecial
        "SITECORE_ID_CERTIFICATE" = (Get-SitecoreCertificateAsBase64String -DnsName "localhost" -Password (ConvertTo-SecureString -String $idCertPassword -Force -AsPlainText) -KeyLength 2048)
        "SITECORE_ID_CERTIFICATE_PASSWORD" = $idCertPassword
        "SITECORE_LICENSE" = ConvertTo-CompressedBase64String -Path $LicenseXmlPath
        "SQL_SERVER" = $SqlServer
        "SQL_USERNAME" = $SqlUserName
        "SQL_PASSWORD" = $SqlSaPassword
        "IS_ALWAYS_ENCRYPTED" = $IsAlwaysEncrypted
        "PROCESSING_ENGINE_TASKS_DATABASE_USERNAME" = $ProcessingEngineTasksDatabaseUserName        
        "SITECORE_GRAPHQL_UPLOADMEDIAOPTIONS_ENCRYPTIONKEY" = Get-SitecoreRandomString 16 -DisallowSpecial
    }
    
    $envFile = Split-Path $EnvFilePath -Leaf
    
    if($envFile -eq "upgrade.env"){
        # Populate the environment file
        Populate-EnvironmentFile -EnvFilePath $EnvFilePath -EnvVariablesTable $envVariablesTable
    }else{
        if (!(Test-Path $CertDataFolder)) {
            Write-Warning -Message "The certificate '$CertDataFolder' path isn't valid. Please, specify another path for certificates."
            return
        }
    
        # Populate the environment file
       # Populate-EnvironmentFile -EnvFilePath $EnvFilePath -EnvVariablesTable $envVariablesTable
       
       if (-not (test-path $EnvFilePath)) {
        New-Item $EnvFilePath -ItemType file
       }

        foreach($key in $envVariablesTable.Keys){
            Set-EnvFileVariable $key -Value $envVariablesTable[$key] -Path $EnvFilePath
        }

        New-Certificates
        
        
        # Add Windows hosts file entries
        Add-WindowsHostsFileEntries -EnvFilePath $EnvFilePath -Topology $Topology -CdHost $CdHost -CmHost $CmHost -IdHost $IdHost
    }
}

$logFilePath = Join-Path -path (Split-Path -Parent $MyInvocation.MyCommand.Path) -ChildPath "compose-init-$(Get-date -f 'yyyyMMddHHmmss').log";
Invoke-ComposeInit *>&1 | Tee-Object $logFilePath