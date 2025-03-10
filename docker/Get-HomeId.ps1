$tokenResponse = .\Get-Token.ps1
$body = '{"query":"{item(where:{path:\"/sitecore/content/home\"}){itemId}}"}'
$headers = @{ 
    "Content-Type"="application/json"
    "Accept"="*/*"
    "Authorization"="Bearer $($tokenResponse.access_token)"
}
$url = "https://xm1cm.localhost/sitecore/api/authoring/graphql/v1"

$response = Invoke-RestMethod -Uri $url -Headers $headers -Body $body -method Post

return $response.data.item.itemId