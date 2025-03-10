param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientSecret
)

# XM Cloud Authentication Endpoint
$Uri = "https://auth.sitecorecloud.io/oauth/token"
$ContentType = 'application/x-www-form-urlencoded'

# Build request body
$Body = @{ 
    grant_type    = 'client_credentials'
    client_id     = $ClientId
    client_secret = $ClientSecret
    audience      = 'https://api.sitecorecloud.io'
}

try {
    # Request token
    $Response = Invoke-WebRequest -Uri $Uri -Method POST -ContentType $ContentType -Body $Body
    
    # Parse response
    $JsonResponse = ConvertFrom-Json -InputObject $Response.Content
    
    # Display token
    Write-Host "`nAccess Token:" -ForegroundColor Green
    Write-Host $JsonResponse.access_token
    
    # Copy to clipboard
    $JsonResponse.access_token | Set-Clipboard
    Write-Host "`nToken copied to clipboard!" -ForegroundColor Yellow
    
    # Show expiration
    $ExpiresIn = [timespan]::FromSeconds($JsonResponse.expires_in)
    Write-Host "`nToken expires in: $($ExpiresIn.ToString())" -ForegroundColor Cyan
}
catch {
    Write-Host "Error getting XM Cloud token: $($_.Exception.Message)" -ForegroundColor Red
}