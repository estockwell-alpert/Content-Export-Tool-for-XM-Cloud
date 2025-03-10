# Get token. Assumes password is 'b'. 
invoke-restmethod https://xm1id.localhost/connect/token -method post `
-headers @{'Content-Type'='application/x-www-form-urlencoded';'Accept'='application/json'} `
-body 'password=b&grant_type=password&username=sitecore%5Cadmin&client_id=postman-api&scope=openid%20sitecore.profile%20sitecore.profile.api'