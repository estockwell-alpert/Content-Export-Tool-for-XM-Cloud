![Hackathon Logo](docs/images/hackathon.png?raw=true 'Hackathon Logo')

# Sitecore Hackathon 2025

## Team name

DED

## Category

The Unicategory

## Description

### Content Export Tool for XM Cloud

The purpose of this module is to enable Sitecore authors (with limited technical ability) to flexibly and easily export content in bulk from Sitecore, using a user friendly UI that enables them to export any configuration of item and fields (no need to write Powershell scripts).

The [Content Export Tool](https://github.com/estockwell-alpert/ContentExportTool), created in 2018, is a .NET Sitecore module that provided these features, but the module is not compatible with XM Cloud since XM Cloud does not allow customizations to the CM file system. This project recreates the Content Export Tool as a standalone Node application that runs in the browser and communicates with the user's XM Cloud or XP instance through the GraphQL API, and introduces new AI features using Copilot.

## Video link

[Video](https://www.youtube.com/watch?v=cL-6R3WKEBQ)

## Pre-requisites and Dependencies

- Docker Desktop
- Node version 22.13.1 or higher
- A Sitecore instance with an available GraphQL endpoint (or use the Edge service)

## Installation instructions

### Docker Build Steps

Run these steps in PowerShell:

1. `cd docker`
2. `Set-ExecutionPolicy -Scope Process Bypass`
3. `.\compose-init.ps1 -LicenseXmlPath path\to\your\license.xml`
4. `.\up.ps1`
5. `start https://xm1cm.localhost`

### Running this Application

You can see the application running by visiting our production instance here: [https://sitecore-content-export.vercel.app](https://sitecore-content-export.vercel.app).

You can connect to application to https://edge.sitecorecloud.io, any Sitecore instance with an available GraphQL endpoint, or set up a new Sitecore instance for testing using the Docker steps above! If you want to try the application without any local setup, use the Vercel link above with any valid GraphQL endpoint or Edge.

To run the application locally, using Node, run the following commands:

1. Ensure Node.js version 22.13.1 or higher is installed
   > Using nvm? Run these commands:
   >
   > ```bash
   > $ nvm install 22.13.1
   > $ nvm use 22.13.1
   > ```
2. Install dependencies:
   ```bash
   $ npm install
   ```
3. Start the local development server:
   ```bash
   $ npm run dev
   ```
4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Setting Up Your Sitecore Instance

Note: We created a Dockerized environment that enables GraphQL authentication, but ran into an issue with CORS configuration, which we will describe in more detail below. Currently exercising this tool requires a PASS or XMC instance. However, we are including these setup steps as
the customizations to identity server are useful, and the CORS isssue is of interest.

#### Docker Setup

1. cd `docker`
2. `.\compose-init.ps1 -LicenseXmlPath C:\path\to\license.xml` (Note: This saves license details to `.env.user` which is excluded from Git to prevent accidental commits.)
3. `up.ps1` (Or run `docker compose --env-file .\.env --env-file .\.env.user up -d`. Multiple ENV references are only needed when building the containers, so that secrets are assigned from `.env.user`. For other commands, `docker compose` will work fine, e.g. `docker compose ps cm`.)

#### Docker Customization Notes

1. The CM image includes SXA, Headless Services, and Management Services, to support GraphQL and command line functionality. In addition, the
   content GraphQL endpoint has been enabled via a mounted `deploy` folder.
2. The Sitecore Identity role has been customized as descibed in this [blog post](http://www.dansolovay.com/2023/01/using-postman-to-authenticate-to-graphql.html) to enable generating Authoroing and Management GraphQL authentication tokens. The small reference scripts [Get-Token.ps1](./docker/Get-Token.ps1) and [Get-HomeId.ps1](./docker/Get-HomeId.ps1) serve as references for how to generate and use tokens provided by this customization.

#### CORS Issue

In attempting to build a local demo environment, we were unable to create an API key that returns a configured CORS header, as [documented](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/cross-origin-resource-sharing--cors-.html#using-an-api-key) by
Sitecore. We will open a Support ticket to report this issue. Since the application returned `Access-Control-Allow-Origin: *` for all requests, including ones with the `sc_apikey` variable, browser security behavior prevented the application working with our local instance. We did not
encounter this issue working with other environements (PaSS and XMC), so this might be a local configuration issue.

## Using the Application

### In App Configuration

If using the production environment (https://sitecore-content-export.vercel.app), or if you've completed the local development server setup, you'll need to configure instances within the app. Think of these as "connections" to your Sitecore instances.

From within the application:

1. On the left hand side of the screen, click the dropdown menu for "Content" and select the `Setup` option. Or go directly to it by visiting [/settings/instance](/settings/instance).
2. There are two options:
   - If you are using XM Cloud or already have an access token for the Authoring APIs configured, select the `Add API Token` button.
     - Once you've clicked the button, select the product, and fill in the fields.
   - If you are using XP or XM and do not currently have an access token, select the `Generate Token` button and fill in the required fields. If you have done so already, check out the section below on how to set up your Sitecore instance. This will be required to generate the token.
3. Once you have added atleast one instance, you can now use the `Export Tool` or `Copilot` pages to start working with your content.

### Content Export:

1. Follow the In App Configuration section to to configure your instance settings
   ![Instance Configuration](https://github.com/Sitecore-Hackathon/2025-DED/blob/main/docs/images/InstanceConfiguration.png)
2. Navigate to the Content Export Tool (/Content/Export)
3. Select your Instance from the dropdown
4. Enter your filters
   - Start Item(s): One of more item IDs specifying where to pull content from, separated by comma. Defaults to the full content tree
   - Templates: One or more template ID to specify what types of items to export
   - Fields: All of the fields that you want included in the export. Null/invalid fields will return "n/a" in the export, so you can include fields that do not exist on all items
     ![Export Page](https://github.com/Sitecore-Hackathon/2025-DED/blob/main/docs/images/Export.png)
5. Click Run Export and wait for your CSV to download!

### Content Import:

Example files:

[Update Content](https://github.com/Sitecore-Hackathon/2025-DED/blob/main/docs/exampleFiles/Import-Update.csv)

[Create Content](https://github.com/Sitecore-Hackathon/2025-DED/blob/main/docs/exampleFiles/Import-Create.csv)

1. Following the In App Configuration section, configure an **authoring API endpoing endpoint**, e.g. https://mysite.sc/sitecore/api/authoring/graphql/v1/

   ![Instance Configuration](https://github.com/Sitecore-Hackathon/2025-DED/blob/main/docs/images/AuthoringSetup.png)

2. Navigate to the Content Export Tool (/Content/Export)
3. Select your Instance from the dropdown
4. Select the Import tab
5. Upload a CSV file
   - Required columns:
     - Update: Item Path
     - Create: Item Path, Template, Name
6. Select Update (default) or Create
7. Click Import
8. The post requests to the authoring API do not currently work due to a CORS error, but you can see the generated GraphQL queries in the Console
   ![Import Page](https://github.com/Sitecore-Hackathon/2025-DED/blob/main/docs/images/Import.png)

### Copilot:

This service is similar to the export tool but uses AI with Gen AI Function Calling to parse together the correct parameters for the function. To use this feature, you must have the following configured:

- An OpenAI API Key
  - Add this key to the API Tokens page within the App (currently the app only supports OpenAI)
- A connection to Edge or a Sitecore content delivery environment

Once you are on the Copilot page (https://sitecore-content-export.vercel.app/content/copilot), you can select the instance you want to work with, the model from OpenAI that you want to use, and then the prompt you want to use to interact with the AI assistant. There are also shortcut buttons to enable specific commands to get to a specific point in the process with the Content assistant. Follow along with the prompts to get the content you need and convert that content into specific formats.

## Known Bugs and Next Steps

- Update feature does not work from the browser due to CORS
- There is a known export bug with outputting fields that contain quotes and commas, where these fields get broken across multiple cells in Excel. This may affect the output of rich text fields.
